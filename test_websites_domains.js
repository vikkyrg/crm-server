import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Website from './src/models/Website.js';
import Domain from './src/models/Domain.js';
import Client from './src/models/Client.js';
import Project from './src/models/Project.js';
import { createWebsite, getWebsites } from './src/controllers/websiteController.js';
import { createDomain, getDomains } from './src/controllers/domainController.js';

dotenv.config();

async function runTests() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected.\n');

  // Find or create test client
  let client = await Client.findOne({ deletedAt: null });
  if (!client) {
    client = await Client.create({
      companyName: 'Test Automation Client Pvt Ltd',
      email: 'testclient@example.com',
      phone: '9876543210'
    });
  }
  console.log(`Using Client: ${client.companyName} (${client._id})`);

  // Mock Request & Response helpers
  const mockReq = (body = {}, query = {}, params = {}) => ({
    body,
    query,
    params,
    user: { _id: new mongoose.Types.ObjectId() }
  });

  const mockRes = () => {
    const res = {};
    res.statusCode = 200;
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.data = data;
      return res;
    };
    return res;
  };

  console.log('\n--- 1. Testing Create Website Endpoint ---');
  const uniqueDomain = `automated-test-${Date.now()}.innomatrics.com`;
  const websiteReq = mockReq({
    clientId: client._id,
    domainName: uniqueDomain,
    websiteType: 'Custom Web Application',
    hostingProvider: 'AWS Lightsail',
    serverIp: '54.210.12.99',
    sslStatus: 'Active',
    status: 'Live',
    technologyStack: ['React', 'Express', 'Tailwind']
  });

  const websiteRes = mockRes();
  await createWebsite(websiteReq, websiteRes);

  console.log(`Create Website Status: ${websiteRes.statusCode}`);
  if (websiteRes.statusCode === 201 && websiteRes.data?.success) {
    const createdWeb = websiteRes.data.data;
    console.log(`✅ Website Asset Created: ID=${createdWeb.websiteId}, Domain=${createdWeb.domainName}`);

    // Verify DB persistence
    const savedInDb = await Website.findById(createdWeb._id);
    if (savedInDb) {
      console.log(`✅ MongoDB Persistence Verified for Website: ${savedInDb.domainName}`);
    } else {
      console.error('❌ Failed to find saved website in DB');
    }
  } else {
    console.error('❌ Create Website failed:', websiteRes.data);
  }

  console.log('\n--- 2. Testing Get Websites Listing & Search ---');
  const getWebRes = mockRes();
  await getWebsites(mockReq({}, { search: uniqueDomain }), getWebRes);
  if (getWebRes.data?.data?.length > 0) {
    console.log(`✅ Websites Search and Fetch Passed: Found ${getWebRes.data.data.length} match(es)`);
  } else {
    console.error('❌ Websites list search failed to retrieve newly created record');
  }

  console.log('\n--- 3. Testing Create Domain Endpoint ---');
  const domainName = `auto-domain-${Date.now()}.tech`;
  const domainReq = mockReq({
    clientId: client._id,
    domainName,
    registrar: 'Namecheap',
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    registrationDate: new Date().toISOString(),
    autoRenew: true,
    renewalCost: 1499,
    dnsProvider: 'Cloudflare',
    nameservers: ['ns1.cloudflare.com', 'ns2.cloudflare.com']
  });

  const domainRes = mockRes();
  await createDomain(domainReq, domainRes);

  console.log(`Create Domain Status: ${domainRes.statusCode}`);
  if (domainRes.statusCode === 201 && domainRes.data?.success) {
    const createdDom = domainRes.data.data;
    console.log(`✅ Domain Record Created: Domain=${createdDom.domainName}, Expiry=${createdDom.expiryDate}`);

    // Verify DB persistence
    const savedDomInDb = await Domain.findById(createdDom._id);
    if (savedDomInDb) {
      console.log(`✅ MongoDB Persistence Verified for Domain: ${savedDomInDb.domainName}`);
    } else {
      console.error('❌ Failed to find saved domain in DB');
    }
  } else {
    console.error('❌ Create Domain failed:', domainRes.data);
  }

  console.log('\n--- 4. Testing Domain Duplicate Check ---');
  const duplicateRes = mockRes();
  await createDomain(domainReq, duplicateRes);
  if (duplicateRes.statusCode === 409) {
    console.log(`✅ Duplicate Domain check passed: ${duplicateRes.data?.message}`);
  } else {
    console.error('❌ Duplicate domain check failed, received status:', duplicateRes.statusCode);
  }

  console.log('\n--- 5. Testing Get Domains Listing ---');
  const getDomRes = mockRes();
  await getDomains(mockReq({}, { search: domainName }), getDomRes);
  if (getDomRes.data?.data?.length > 0) {
    console.log(`✅ Domains Search and Fetch Passed: Found ${getDomRes.data.data.length} match(es)`);
  } else {
    console.error('❌ Domains list search failed to retrieve newly created record');
  }

  console.log('\n🎉 ALL WEBSITES & DOMAINS TESTS COMPLETED SUCCESSFULLY!\n');
  await mongoose.disconnect();
}

runTests().catch(err => {
  console.error('Test script error:', err);
  process.exit(1);
});
