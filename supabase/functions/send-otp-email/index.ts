
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OTPRequest {
  email: string;
  otp: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp }: OTPRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "BrilliantBot <onboarding@resend.dev>",
      to: [email],
      subject: "Your BrilliantBot Admin OTP",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <div style="color: white; font-size: 32px;">🛡️</div>
            </div>
            <h1 style="color: #1f2937; margin: 0; font-size: 28px; font-weight: 700;">BrilliantBot</h1>
            <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 16px;">Admin Access Verification</p>
          </div>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 32px;">
            <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">Your One-Time Password</h2>
            <div style="background: white; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0; display: inline-block;">
              <span style="font-size: 32px; font-weight: 700; color: #3b82f6; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
            </div>
            <p style="color: #6b7280; margin: 16px 0 0 0; font-size: 14px;">This code will expire in 10 minutes</p>
          </div>
          
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 32px;">
            <p style="color: #b91c1c; margin: 0; font-size: 14px; font-weight: 500;">🔒 Security Notice</p>
            <p style="color: #7f1d1d; margin: 8px 0 0 0; font-size: 14px;">Never share this OTP with anyone. Our team will never ask for your OTP.</p>
          </div>
          
          <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              If you didn't request this OTP, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    console.log("OTP email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-otp-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
