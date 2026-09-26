import fs from 'fs';
import path from 'path';

const modelsDir = path.join(process.cwd(), 'src/models');
const controllersDir = path.join(process.cwd(), 'src/controllers');
const routesDir = path.join(process.cwd(), 'src/routes');

const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js'));

const generatedRoutes = [];

modelFiles.forEach(file => {
  const modelName = file.replace('.js', '');
  
  if (['User', 'Role', 'AuditLog'].includes(modelName)) {
    generatedRoutes.push({ modelName, routeName: modelName.toLowerCase() + "Routes" });
    return;
  }
  
  const lowerName = modelName.toLowerCase();

  const controllerContent = "import " + modelName + " from '../models/" + modelName + ".js';\n" +
"export const get" + modelName + "s = async (req, res) => {\n" +
"  try {\n" +
"    const data = await " + modelName + ".find({ deletedAt: null });\n" +
"    res.json({ success: true, data });\n" +
"  } catch (error) {\n" +
"    res.status(500).json({ success: false, message: error.message });\n" +
"  }\n" +
"};\n\n" +
"export const get" + modelName + " = async (req, res) => {\n" +
"  try {\n" +
"    const data = await " + modelName + ".findById(req.params.id);\n" +
"    if (!data) return res.status(404).json({ success: false, message: 'Not found' });\n" +
"    res.json({ success: true, data });\n" +
"  } catch (error) {\n" +
"    res.status(500).json({ success: false, message: error.message });\n" +
"  }\n" +
"};\n\n" +
"export const create" + modelName + " = async (req, res) => {\n" +
"  try {\n" +
"    const data = await " + modelName + ".create({ ...req.body, createdBy: req.user._id });\n" +
"    res.status(201).json({ success: true, data });\n" +
"  } catch (error) {\n" +
"    res.status(500).json({ success: false, message: error.message });\n" +
"  }\n" +
"};\n\n" +
"export const update" + modelName + " = async (req, res) => {\n" +
"  try {\n" +
"    const data = await " + modelName + ".findByIdAndUpdate(\n" +
"      req.params.id, \n" +
"      { ...req.body, updatedBy: req.user._id }, \n" +
"      { new: true, runValidators: true }\n" +
"    );\n" +
"    if (!data) return res.status(404).json({ success: false, message: 'Not found' });\n" +
"    res.json({ success: true, data });\n" +
"  } catch (error) {\n" +
"    res.status(500).json({ success: false, message: error.message });\n" +
"  }\n" +
"};\n\n" +
"export const delete" + modelName + " = async (req, res) => {\n" +
"  try {\n" +
"    const data = await " + modelName + ".findByIdAndUpdate(\n" +
"      req.params.id, \n" +
"      { deletedAt: new Date(), updatedBy: req.user._id },\n" +
"      { new: true }\n" +
"    );\n" +
"    if (!data) return res.status(404).json({ success: false, message: 'Not found' });\n" +
"    res.json({ success: true, message: 'Deleted successfully' });\n" +
"  } catch (error) {\n" +
"    res.status(500).json({ success: false, message: error.message });\n" +
"  }\n" +
"};\n";

  const routeContent = "import express from 'express';\n" +
"import { get" + modelName + "s, get" + modelName + ", create" + modelName + ", update" + modelName + ", delete" + modelName + " } from '../controllers/" + lowerName + "Controller.js';\n" +
"import { protect, authorize } from '../middleware/auth.js';\n" +
"import { auditAction } from '../middleware/audit.js';\n\n" +
"const router = express.Router();\n\n" +
"router.route('/')\n" +
"  .get(protect, authorize('" + modelName + "', 'view'), get" + modelName + "s)\n" +
"  .post(protect, authorize('" + modelName + "', 'create'), auditAction('" + modelName + "', 'CREATE'), create" + modelName + ");\n\n" +
"router.route('/:id')\n" +
"  .get(protect, authorize('" + modelName + "', 'view'), get" + modelName + ")\n" +
"  .put(protect, authorize('" + modelName + "', 'edit'), auditAction('" + modelName + "', 'UPDATE'), update" + modelName + ")\n" +
"  .delete(protect, authorize('" + modelName + "', 'delete'), auditAction('" + modelName + "', 'DELETE'), delete" + modelName + ");\n\n" +
"export default router;\n";

  fs.writeFileSync(path.join(controllersDir, lowerName + 'Controller.js'), controllerContent);
  fs.writeFileSync(path.join(routesDir, lowerName + 'Routes.js'), routeContent);
  
  generatedRoutes.push({ modelName, routeName: lowerName + 'Routes' });
  console.log("Generated CRUD for " + modelName);
});

let serverContent = fs.readFileSync(path.join(process.cwd(), 'src/server.js'), 'utf8');

const imports = generatedRoutes.map(g => "import " + g.routeName + " from './routes/" + g.routeName + ".js';").join('\n');
const uses = generatedRoutes.map(g => "app.use('/api/" + g.modelName.toLowerCase() + "s', " + g.routeName + ");").join('\n');

serverContent = serverContent.replace(/import .*?Routes from '\.\/routes\/.*?Routes\.js';/g, ''); 
serverContent = serverContent.replace(/app\.use\('\/api\/.*?', .*?Routes\);/g, ''); 

const importInsertPos = serverContent.indexOf('dotenv.config();');
serverContent = serverContent.slice(0, importInsertPos) + imports + '\n\n' + serverContent.slice(importInsertPos);

const useInsertPos = serverContent.indexOf('// Basic error handler');
serverContent = serverContent.slice(0, useInsertPos) + uses + '\n\n' + serverContent.slice(useInsertPos);

fs.writeFileSync(path.join(process.cwd(), 'src/server.js'), serverContent);
console.log('Updated server.js with all routes');
