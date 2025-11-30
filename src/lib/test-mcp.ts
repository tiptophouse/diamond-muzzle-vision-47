import { listMCPTools, callMCPTool } from './mcp-client';

/**
 * Test the FastAPI MCP connection
 */
export async function testMCPConnection() {
  console.log('🧪 Testing FastAPI MCP Connection...');
  console.log('📍 Endpoint: https://api.mazalbot.com/mcp/messages');
  
  try {
    // Test 1: List available tools
    console.log('\n📋 Test 1: Listing available MCP tools...');
    const toolsResponse = await listMCPTools();
    
    if (!toolsResponse.success) {
      console.error('❌ Failed to list tools:', toolsResponse.error);
      return {
        success: false,
        error: toolsResponse.error,
        test: 'list_tools'
      };
    }
    
    console.log('✅ MCP Tools retrieved successfully!');
    console.log('📊 Response:', JSON.stringify(toolsResponse.data, null, 2));
    
    const tools = toolsResponse.data?.result?.tools || [];
    console.log(`\n🔧 Found ${tools.length} tools:`);
    tools.forEach((tool: any, index: number) => {
      console.log(`  ${index + 1}. ${tool.name} - ${tool.description}`);
    });
    
    // Test 2: Try calling a simple tool if available
    if (tools.length > 0) {
      const firstTool = tools[0];
      console.log(`\n🎯 Test 2: Attempting to call tool: ${firstTool.name}`);
      
      // Call the first tool with empty args (might fail, but tests the flow)
      const callResponse = await callMCPTool(firstTool.name, {});
      
      if (callResponse.success) {
        console.log('✅ Tool call successful!');
        console.log('📊 Result:', JSON.stringify(callResponse.data, null, 2));
      } else {
        console.log('⚠️ Tool call returned error (expected if args required):', callResponse.error);
      }
    }
    
    return {
      success: true,
      toolCount: tools.length,
      tools: tools.map((t: any) => ({ name: t.name, description: t.description }))
    };
    
  } catch (error) {
    console.error('💥 MCP Connection Test Failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Auto-run test on import in development
if (import.meta.env.DEV) {
  console.log('🚀 Auto-running MCP connection test...');
  testMCPConnection().then(result => {
    console.log('\n📋 Final Test Result:', result);
  });
}
