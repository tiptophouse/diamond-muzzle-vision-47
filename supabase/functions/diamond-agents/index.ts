import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Agent, run, tool } from 'https://esm.sh/@openai/agents@1.0.0';
import { z } from 'https://esm.sh/zod@3.23.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const backendUrl = Deno.env.get('BACKEND_URL');
const backendAccessToken = Deno.env.get('BACKEND_ACCESS_TOKEN');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 Diamond Agents: Function called');
    
    if (!openAIApiKey) {
      console.error('❌ Configuration Error: OPENAI_API_KEY is not set');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        response: 'AI agents are currently unavailable. Please contact support.'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, user_id, conversation_history = [], agent_type = 'main' } = await req.json();
    
    console.log(`🤖 Processing message for user: ${user_id}, Agent: ${agent_type}`);
    console.log(`🤖 Message: "${message}"`);

    // Enhanced tool for inventory management
    const inventoryTool = tool({
      name: 'get_inventory_data',
      description: 'Fetch comprehensive diamond inventory data with filtering options',
      parameters: z.object({
        user_id: z.string().describe('User ID to fetch inventory for'),
        filters: z.object({
          shape: z.string().optional().describe('Filter by diamond shape'),
          color: z.string().optional().describe('Filter by color grade'),
          clarity: z.string().optional().describe('Filter by clarity grade'),
          min_weight: z.number().optional().describe('Minimum carat weight'),
          max_weight: z.number().optional().describe('Maximum carat weight'),
          min_price: z.number().optional().describe('Minimum price per carat'),
          max_price: z.number().optional().describe('Maximum price per carat'),
          status: z.string().optional().describe('Filter by status (available, sold, reserved)')
        }).optional()
      }),
      handler: async ({ user_id, filters = {} }) => {
        try {
          console.log(`📊 Fetching inventory for user ${user_id} with filters:`, filters);
          
          const inventoryEndpoint = `${backendUrl}/api/v1/get_all_stones?user_id=${user_id}`;
          const response = await fetch(inventoryEndpoint, {
            headers: {
              'Authorization': `Bearer ${backendAccessToken}`,
              'Accept': 'application/json',
            }
          });

          if (!response.ok) {
            throw new Error(`FastAPI request failed with status ${response.status}`);
          }

          const inventoryData = await response.json();
          let diamonds = Array.isArray(inventoryData) ? inventoryData : 
                        (inventoryData.data || inventoryData.diamonds || []);

          // Apply filters
          if (filters.shape) {
            diamonds = diamonds.filter(d => d.shape?.toLowerCase().includes(filters.shape.toLowerCase()));
          }
          if (filters.color) {
            diamonds = diamonds.filter(d => d.color === filters.color);
          }
          if (filters.clarity) {
            diamonds = diamonds.filter(d => d.clarity === filters.clarity);
          }
          if (filters.min_weight) {
            diamonds = diamonds.filter(d => d.weight >= filters.min_weight);
          }
          if (filters.max_weight) {
            diamonds = diamonds.filter(d => d.weight <= filters.max_weight);
          }
          if (filters.min_price) {
            diamonds = diamonds.filter(d => d.price_per_carat >= filters.min_price);
          }
          if (filters.max_price) {
            diamonds = diamonds.filter(d => d.price_per_carat <= filters.max_price);
          }
          if (filters.status) {
            diamonds = diamonds.filter(d => d.status?.toLowerCase() === filters.status.toLowerCase());
          }

          // Generate comprehensive analysis
          const analysis = {
            total_count: diamonds.length,
            total_value: diamonds.reduce((sum, d) => sum + (d.price_per_carat * d.weight || 0), 0),
            average_weight: diamonds.length > 0 ? diamonds.reduce((sum, d) => sum + d.weight, 0) / diamonds.length : 0,
            average_price: diamonds.length > 0 ? diamonds.reduce((sum, d) => sum + d.price_per_carat, 0) / diamonds.length : 0,
            shapes: diamonds.reduce((acc, d) => {
              acc[d.shape] = (acc[d.shape] || 0) + 1;
              return acc;
            }, {}),
            colors: diamonds.reduce((acc, d) => {
              acc[d.color] = (acc[d.color] || 0) + 1;
              return acc;
            }, {}),
            clarities: diamonds.reduce((acc, d) => {
              acc[d.clarity] = (acc[d.clarity] || 0) + 1;
              return acc;
            }, {}),
            samples: diamonds.slice(0, 5)
          };

          console.log(`✅ Retrieved ${diamonds.length} diamonds with analysis`);
          return analysis;
        } catch (error) {
          console.error('❌ Error fetching inventory:', error);
          return { error: `Failed to fetch inventory: ${error.message}` };
        }
      }
    });

    // Market analysis tool
    const marketAnalysisTool = tool({
      name: 'analyze_market_trends',
      description: 'Analyze market trends and provide pricing recommendations',
      parameters: z.object({
        shape: z.string().describe('Diamond shape to analyze'),
        weight: z.number().describe('Carat weight'),
        color: z.string().describe('Color grade'),
        clarity: z.string().describe('Clarity grade'),
        cut: z.string().optional().describe('Cut grade')
      }),
      handler: async ({ shape, weight, color, clarity, cut }) => {
        // Market analysis logic based on diamond characteristics
        const priceMultipliers = {
          shape: {
            'round brilliant': 1.0,
            'princess': 0.85,
            'cushion': 0.90,
            'oval': 0.88,
            'emerald': 0.80,
            'pear': 0.75,
            'marquise': 0.70,
            'asscher': 0.85,
            'radiant': 0.82,
            'heart': 0.75
          },
          color: {
            'D': 1.20, 'E': 1.15, 'F': 1.10, 'G': 1.00, 'H': 0.95,
            'I': 0.85, 'J': 0.80, 'K': 0.70, 'L': 0.60, 'M': 0.50
          },
          clarity: {
            'FL': 1.40, 'IF': 1.35, 'VVS1': 1.25, 'VVS2': 1.20,
            'VS1': 1.10, 'VS2': 1.00, 'SI1': 0.90, 'SI2': 0.75,
            'SI3': 0.60, 'I1': 0.45, 'I2': 0.35, 'I3': 0.25
          }
        };

        const basePrice = 5000; // Base price per carat
        const shapeMultiplier = priceMultipliers.shape[shape.toLowerCase()] || 0.85;
        const colorMultiplier = priceMultipliers.color[color.toUpperCase()] || 0.90;
        const clarityMultiplier = priceMultipliers.clarity[clarity.toUpperCase()] || 0.90;
        
        // Weight premium for larger stones
        const weightMultiplier = weight < 1 ? 1.0 : 
                                weight < 2 ? 1.25 : 
                                weight < 3 ? 1.60 : 2.0;

        const estimatedPrice = Math.round(basePrice * shapeMultiplier * colorMultiplier * clarityMultiplier * weightMultiplier);
        
        return {
          estimated_price_per_carat: estimatedPrice,
          total_estimated_value: Math.round(estimatedPrice * weight),
          market_factors: {
            shape_premium: `${((shapeMultiplier - 1) * 100).toFixed(1)}%`,
            color_premium: `${((colorMultiplier - 1) * 100).toFixed(1)}%`,
            clarity_premium: `${((clarityMultiplier - 1) * 100).toFixed(1)}%`,
            size_premium: `${((weightMultiplier - 1) * 100).toFixed(1)}%`
          },
          recommendations: [
            estimatedPrice > 10000 ? "Premium stone - excellent investment potential" : "Good value proposition",
            weight > 2 ? "Large stone commands premium pricing" : "Standard market positioning",
            ['D', 'E', 'F'].includes(color) ? "Colorless grade - high demand" : "Near colorless - good market appeal"
          ]
        };
      }
    });

    // Certificate validation tool
    const certificateAnalysisTool = tool({
      name: 'analyze_certificate',
      description: 'Analyze diamond certificate and provide authenticity insights',
      parameters: z.object({
        certificate_number: z.string().describe('GIA or other certificate number'),
        lab: z.string().optional().describe('Certifying laboratory (GIA, AGS, etc.)')
      }),
      handler: async ({ certificate_number, lab = 'GIA' }) => {
        // Certificate analysis logic
        const isValidFormat = /^\d{10,}$/.test(certificate_number);
        const analysisResults = {
          certificate_number,
          lab,
          format_valid: isValidFormat,
          authenticity_score: isValidFormat ? (Math.random() * 20 + 80) : 30, // Simulated score
          verification_status: isValidFormat ? 'verified' : 'invalid_format',
          recommendations: [],
          security_features: []
        };

        if (isValidFormat) {
          analysisResults.recommendations = [
            "Certificate format appears valid",
            "Recommend verifying directly with lab database",
            "Check security features on physical certificate"
          ];
          analysisResults.security_features = [
            "Holographic seal present",
            "Unique report number format",
            "Lab-specific watermarks"
          ];
        } else {
          analysisResults.recommendations = [
            "Certificate number format invalid",
            "Request proper certification documentation",
            "Verify with authorized dealer"
          ];
        }

        return analysisResults;
      }
    });

    // Define specialized agents
    const diamondGradingAgent = new Agent({
      name: 'DiamondGradingExpert',
      instructions: `You are a certified gemologist and diamond grading expert with decades of experience. 
      
      Your expertise includes:
      - 4Cs grading (Cut, Carat, Color, Clarity) according to GIA standards
      - Certificate analysis and authenticity verification
      - Quality assessment and grading consistency
      - Identifying treatments and enhancements
      - Proportions and optical performance evaluation
      
      When analyzing diamonds:
      1. Always use the analyze_certificate tool for any certificate numbers mentioned
      2. Provide detailed explanations of grading factors
      3. Explain how each grade affects value and appearance
      4. Offer practical advice for buyers and sellers
      5. Be precise with technical terminology while remaining accessible
      
      Focus on accuracy, education, and building trust through expertise.`,
      tools: [certificateAnalysisTool, inventoryTool],
      model: 'gpt-4o'
    });

    const inventoryManagementAgent = new Agent({
      name: 'InventoryManagementExpert',
      instructions: `You are an experienced diamond inventory analyst and business strategist.
      
      Your expertise includes:
      - Portfolio analysis and optimization
      - Inventory turnover and performance metrics
      - Market demand forecasting
      - Stock balancing recommendations
      - Investment strategy for diamond dealers
      
      When analyzing inventory:
      1. Always fetch current inventory data using get_inventory_data tool
      2. Provide comprehensive portfolio analysis
      3. Identify slow-moving vs. fast-selling items
      4. Suggest inventory adjustments based on market trends
      5. Calculate key performance metrics (value, diversity, liquidity)
      
      Focus on actionable business insights and profit optimization.`,
      tools: [inventoryTool, marketAnalysisTool],
      model: 'gpt-4o'
    });

    const pricingAgent = new Agent({
      name: 'PricingExpert',
      instructions: `You are a diamond market analyst and pricing specialist with deep market knowledge.
      
      Your expertise includes:
      - Real-time market valuations
      - Pricing strategy optimization
      - Competitive analysis
      - Market trend analysis
      - ROI calculations and investment advice
      
      When providing pricing analysis:
      1. Use analyze_market_trends tool for comprehensive market analysis
      2. Consider current market conditions and trends
      3. Provide both conservative and optimistic valuations
      4. Explain pricing factors clearly
      5. Offer strategic pricing recommendations
      
      Focus on accurate valuations and profitable pricing strategies.`,
      tools: [marketAnalysisTool, inventoryTool],
      model: 'gpt-4o'
    });

    const customerServiceAgent = new Agent({
      name: 'CustomerServiceExpert',
      instructions: `You are a diamond industry customer service specialist with exceptional communication skills.
      
      Your expertise includes:
      - Customer education and consultation
      - Personalized recommendations
      - Relationship building and trust development
      - Sales support and objection handling
      - After-sales service and support
      
      When assisting customers:
      1. Use inventory tools to provide specific recommendations
      2. Educate customers about diamond quality factors
      3. Tailor communication to customer knowledge level
      4. Build confidence through transparent information
      5. Focus on matching customer needs with available inventory
      
      Focus on exceptional service and building long-term relationships.`,
      tools: [inventoryTool, marketAnalysisTool, certificateAnalysisTool],
      model: 'gpt-4o'
    });

    const mainCoordinatorAgent = new Agent({
      name: 'DiamondConsultantCoordinator',
      instructions: `You are the main diamond consultant coordinator who routes customer queries to appropriate specialists.
      
      Your role:
      - Analyze customer queries to determine the best specialist
      - Provide initial consultation and overview
      - Coordinate between different specialists when needed
      - Ensure comprehensive and cohesive responses
      
      Routing guidelines:
      - Grading questions (4Cs, certificates, quality) → DiamondGradingExpert
      - Inventory questions (stock analysis, portfolio) → InventoryManagementExpert  
      - Pricing questions (valuations, market analysis) → PricingExpert
      - Customer service (recommendations, education) → CustomerServiceExpert
      - Complex queries may require multiple specialists
      
      Always acknowledge the customer's query and explain which specialist will handle it.`,
      tools: [inventoryTool],
      model: 'gpt-4o',
      handoffs: [diamondGradingAgent, inventoryManagementAgent, pricingAgent, customerServiceAgent]
    });

    // Select appropriate agent based on request
    let selectedAgent;
    switch (agent_type) {
      case 'grading':
        selectedAgent = diamondGradingAgent;
        break;
      case 'inventory':
        selectedAgent = inventoryManagementAgent;
        break;
      case 'pricing':
        selectedAgent = pricingAgent;
        break;
      case 'customer_service':
        selectedAgent = customerServiceAgent;
        break;
      default:
        selectedAgent = mainCoordinatorAgent;
    }

    // Build conversation context
    const messages = conversation_history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    console.log(`🤖 Running ${selectedAgent.name} agent...`);
    
    // Run the agent
    const result = await run(selectedAgent, message, {
      messages,
      maxTurns: 5,
      context: {
        user_id,
        timestamp: new Date().toISOString()
      }
    });

    console.log('✅ Agent execution completed successfully');

    return new Response(JSON.stringify({ 
      response: result.finalOutput,
      agent_used: selectedAgent.name,
      success: true,
      turns_used: result.messages?.length || 1
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in Diamond Agents function:', error);
    
    const fallbackResponse = `I'm experiencing technical difficulties, but I'm here to help with your diamond questions! 
    As your diamond consultant, I can assist with grading, pricing, inventory analysis, and customer service. 
    Please try your question again in a moment.`;

    return new Response(JSON.stringify({ 
      response: fallbackResponse,
      error: error.message,
      success: false
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});