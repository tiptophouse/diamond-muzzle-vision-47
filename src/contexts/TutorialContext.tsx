import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useOptimizedTelegramAuthContext } from '@/context/OptimizedTelegramAuthContext';
import { enhancedTutorialSteps } from '@/components/tutorial/enhancedTutorialSteps';
import { Diamond } from '@/types/diamond';

interface TutorialContextType {
  currentStep: number;
  isTutorialActive: boolean;
  startTutorial: () => void;
  endTutorial: () => void;
  goToNextStep: () => void;
  goToStep: (step: number) => void;
  tutorialSteps: any[];
  completedSteps: Set<number>;
  markStepAsComplete: (step: number) => void;
  isStepComplete: (step: number) => boolean;
  findDiamondByStockNumber: (stockNumber: string) => Diamond | undefined;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useOptimizedTelegramAuthContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set<number>());

  const tutorialSteps = enhancedTutorialSteps;

  useEffect(() => {
    if (isAuthenticated && user) {
      // Start tutorial automatically on first login
      startTutorial();
    }
  }, [isAuthenticated, user]);

  const startTutorial = () => {
    setIsTutorialActive(true);
    setCurrentStep(0);
  };

  const endTutorial = () => {
    setIsTutorialActive(false);
    setCurrentStep(0);
    setCompletedSteps(new Set<number>());
  };

  const goToNextStep = () => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, tutorialSteps.length - 1));
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const markStepAsComplete = (step: number) => {
    setCompletedSteps((prevCompletedSteps) => new Set(prevCompletedSteps).add(step));
  };

  const isStepComplete = (step: number): boolean => {
    return completedSteps.has(step);
  };

  const findDiamondByStockNumber = (stockNumber: string): Diamond | undefined => {
    // Mock implementation - replace with actual data fetching logic
    const mockDiamond: Diamond = {
      stock_number: stockNumber,
      price: 5000,
      size: 1.5,
      color: 'G',
      clarity: 'VS1',
      shape: 'Round',
      cut: 'Excellent',
      polish: 'Excellent',
      symmetry: 'Excellent',
      fluorescence: 'None',
      lab: 'GIA',
      depth: 62.5,
      table: 58,
      crown_angle: 34.5,
      pavilion_angle: 40.8,
      culet: 'None',
      girdle: 'Medium',
      location: 'New York',
      country: 'USA',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
      latitude: 40.7128,
      longitude: -74.0060,
      image_url: 'https://example.com/diamond.jpg',
      video_url: 'https://example.com/diamond.mp4',
      cert_url: 'https://example.com/diamond_cert.pdf',
      description: 'A beautiful round diamond with excellent cut.',
      is_natural: true,
      is_conflict_free: true,
      measurements: '7.4 x 7.45 x 4.6 mm',
      ratio: 1.0,
      rapnet_price: 4800,
      bluenile_price: 5200,
      jamesallen_price: 5100,
      gia_report_number: '1234567890',
      ags_report_number: null,
      igi_report_number: null,
      created_at: new Date(),
      updated_at: new Date(),
      user_id: user?.id || 1,
      is_featured: true,
      is_new_arrival: true,
      is_on_sale: false,
      sale_percentage: 0,
      views: 123,
      likes: 45,
      shares: 6,
      is_available: true,
      cost: 4500,
      margin: 500,
      profit: 500,
      currency: 'USD',
      premium_features: ['360 video', 'Ideal-Scope image'],
      lab_analyst_name: 'John Doe',
      lab_analyst_email: 'john.doe@gia.com',
      lab_analyst_phone: '123-456-7890',
      lab_report_date: new Date(),
      lab_report_conclusion: 'Diamond meets GIA standards.',
      lab_report_details: 'Detailed analysis of the diamond properties.',
      lab_grading_system: 'GIA Grading System',
      lab_additional_notes: 'No additional notes.',
      appraisal_value: 5500,
      appraisal_date: new Date(),
      appraiser_name: 'Jane Smith',
      appraiser_email: 'jane.smith@appraisals.com',
      appraiser_phone: '098-765-4321',
      appraisal_company: 'XYZ Appraisals',
      appraisal_report_number: 'XYZ098765',
      insurance_company: 'ABC Insurance',
      insurance_policy_number: 'ABC123456',
      insurance_value: 6000,
      insurance_expiry_date: new Date(),
      insurance_contact_name: 'Mike Johnson',
      insurance_contact_email: 'mike.j@abcinsurance.com',
      insurance_contact_phone: '111-222-3333',
      metadata: {
        source: 'RapNet',
        last_updated: new Date(),
        data_quality_score: 0.95,
        completeness_score: 0.98,
        consistency_score: 0.99
      },
      customer_reviews: [
        {
          customer_id: 101,
          review_text: 'Excellent diamond, great sparkle!',
          rating: 5,
          review_date: new Date()
        }
      ],
      related_products: ['Engagement Ring', 'Diamond Pendant'],
      maintenance_tips: ['Clean with mild soap and water.', 'Store in a soft pouch.'],
      warranty_details: 'Lifetime warranty against defects.',
      shipping_options: ['Standard', 'Express'],
      return_policy: '30-day return policy.',
      payment_options: ['Credit Card', 'PayPal', 'Wire Transfer'],
      seo_keywords: ['round diamond', 'gia certified', 'vs1 clarity'],
      seo_description: 'Buy a beautiful GIA certified round diamond with VS1 clarity.',
      internal_notes: 'Check inventory levels.',
      supplier_id: 201,
      supplier_name: 'Diamond Supplier Inc.',
      supplier_contact_name: 'Bob Williams',
      supplier_contact_email: 'bob.w@diamonds.com',
      supplier_contact_phone: '444-555-6666',
      cost_breakdown: {
        diamond_cost: 4000,
        lab_certification_cost: 200,
        shipping_cost: 100,
        insurance_cost: 200
      },
      packaging_options: ['Gift Box', 'Standard Packaging'],
      customization_options: ['Engraving', 'Setting Change'],
      lead_time: '3-5 business days',
      production_location: 'India',
      ethical_sourcing_details: 'Sourced from conflict-free zones.',
      environmental_impact_score: 0.85,
      carbon_footprint: '10 kg CO2',
      recyclability_score: 0.9,
      social_responsibility_initiatives: ['Supporting local communities.'],
      awards_and_certifications: ['Best Diamond Award 2022'],
      market_trends: ['Increasing demand for lab-grown diamonds.'],
      future_predictions: ['Price increase expected in Q4.'],
      competitor_analysis: ['Compared to similar diamonds from competitors.'],
      customer_segmentation: ['High-end customers seeking quality.'],
      marketing_campaigns: ['Summer Sale', 'Anniversary Discount'],
      sales_performance: {
        monthly_sales: 10,
        quarterly_sales: 30,
        yearly_sales: 120
      },
      inventory_levels: {
        current_stock: 5,
        reorder_point: 2,
        lead_time_for_restock: '2 weeks'
      },
      quality_control_checks: ['Visual inspection', 'Microscopic analysis'],
      defect_rate: 0.01,
      return_rate: 0.02,
      customer_satisfaction_score: 4.8,
      net_promoter_score: 70,
      customer_feedback_analysis: ['Positive feedback on sparkle and cut.'],
      risk_assessment: ['Price fluctuations', 'Supply chain disruptions'],
      mitigation_strategies: ['Diversify suppliers', 'Hedge against price changes'],
      compliance_standards: ['GIA certification', 'Kimberley Process'],
      legal_disclaimers: ['Diamond weight and measurements are approximate.'],
      terms_and_conditions: ['See website for full terms and conditions.'],
      privacy_policy: ['We protect your personal information.'],
      accessibility_features: ['Screen reader compatibility', 'Keyboard navigation'],
      multilingual_support: ['English', 'Spanish', 'French'],
      mobile_responsiveness: true,
      cross_browser_compatibility: true,
      performance_metrics: {
        page_load_time: 1.2,
        server_response_time: 0.3,
        database_query_time: 0.1
      },
      security_measures: ['SSL encryption', 'Regular security audits'],
      disaster_recovery_plan: ['Backup servers in multiple locations.'],
      version_control: 'Git',
      deployment_strategy: 'Continuous deployment',
      monitoring_tools: ['New Relic', 'DataDog'],
      team_communication_tools: ['Slack', 'Microsoft Teams'],
      project_management_tools: ['Jira', 'Asana'],
      documentation: ['API documentation', 'User guides'],
      training_materials: ['Video tutorials', 'Online courses'],
      support_channels: ['Email', 'Phone', 'Chat'],
      service_level_agreements: ['99.9% uptime guarantee.'],
      escalation_procedures: ['Contact support manager.'],
      customer_onboarding_process: ['Welcome email', 'Guided tour'],
      customer_retention_strategies: ['Loyalty program', 'Personalized offers'],
      churn_rate: 0.05,
      customer_lifetime_value: 10000,
      referral_program: ['Refer a friend and get a discount.'],
      affiliate_program: ['Earn commission on sales.'],
      influencer_marketing: ['Partnering with jewelry influencers.'],
      social_media_strategy: ['Engaging content', 'Targeted ads'],
      email_marketing_campaigns: ['New product announcements', 'Promotional offers'],
      content_marketing_strategy: ['Blog posts', 'Infographics'],
      search_engine_optimization: ['Keyword research', 'Link building'],
      pay_per_click_advertising: ['Google Ads', 'Bing Ads'],
      conversion_rate_optimization: ['A/B testing', 'Landing page optimization'],
      analytics_tools: ['Google Analytics', 'Mixpanel'],
      data_visualization_tools: ['Tableau', 'Power BI'],
      reporting_frequency: 'Monthly',
      key_performance_indicators: ['Sales', 'Customer satisfaction', 'Churn rate'],
      data_driven_decision_making: ['Using data to inform business decisions.'],
      innovation_strategy: ['Exploring new technologies and trends.'],
      research_and_development: ['Investing in new products and services.'],
      intellectual_property_protection: ['Patents', 'Trademarks'],
      competitive_advantage: ['Superior quality', 'Exceptional customer service'],
      sustainability_practices: ['Ethical sourcing', 'Environmental responsibility'],
      corporate_social_responsibility: ['Supporting local communities.'],
      governance_structure: ['Board of directors', 'Executive team'],
      risk_management_framework: ['Identifying and mitigating risks.'],
      business_continuity_plan: ['Ensuring operations continue in case of disruption.'],
      financial_performance: {
        revenue: 1000000,
        profit_margin: 0.2,
        return_on_investment: 0.15
      },
      funding_sources: ['Venture capital', 'Angel investors'],
      capital_structure: ['Equity', 'Debt'],
      investor_relations: ['Regular communication with investors.'],
      exit_strategy: ['IPO', 'Acquisition'],
      succession_planning: ['Identifying and training future leaders.'],
      organizational_culture: ['Collaborative', 'Innovative'],
      employee_engagement: ['Regular surveys', 'Team-building activities'],
      talent_acquisition_strategy: ['Attracting and retaining top talent.'],
      diversity_and_inclusion: ['Promoting diversity and inclusion in the workplace.'],
      employee_training_and_development: ['Providing opportunities for growth and development.'],
      compensation_and_benefits: ['Competitive salaries', 'Comprehensive benefits package'],
      workplace_safety: ['Ensuring a safe and healthy work environment.'],
      employee_wellness_programs: ['Promoting employee well-being.'],
      labor_relations: ['Maintaining positive labor relations.'],
      human_rights_policy: ['Respecting human rights in all operations.'],
      supply_chain_management: ['Ensuring ethical and sustainable supply chains.'],
      supplier_code_of_conduct: ['Setting standards for supplier behavior.'],
      environmental_management_system: ['Reducing environmental impact.'],
      waste_reduction_programs: ['Recycling and waste reduction initiatives.'],
      energy_efficiency_measures: ['Reducing energy consumption.'],
      water_conservation_efforts: ['Conserving water resources.'],
      pollution_prevention: ['Preventing pollution of air, water, and soil.'],
      climate_change_mitigation: ['Reducing greenhouse gas emissions.'],
      biodiversity_conservation: ['Protecting biodiversity and ecosystems.'],
      community_engagement: ['Supporting local communities.'],
      philanthropic_activities: ['Donating to charitable causes.'],
      volunteer_programs: ['Encouraging employee volunteerism.'],
      ethical_marketing_practices: ['Honest and transparent marketing.'],
      responsible_advertising: ['Avoiding misleading or deceptive advertising.'],
      consumer_privacy_protection: ['Protecting consumer privacy and data.'],
      data_security_measures: ['Protecting data from unauthorized access.'],
      cybersecurity_protocols: ['Preventing cyberattacks and data breaches.'],
      crisis_management_plan: ['Responding to crises and emergencies.'],
      reputation_management: ['Protecting and enhancing the company\'s reputation.'],
      stakeholder_engagement: ['Engaging with stakeholders to address concerns.'],
      transparency_and_accountability: ['Being transparent and accountable in all operations.'],
      continuous_improvement: ['Continuously improving performance and sustainability.'],
      long_term_vision: ['Creating a sustainable and successful business for the future.']
    };

    return mockDiamond.stock_number === stockNumber ? mockDiamond : undefined;
  };

  const value: TutorialContextType = {
    currentStep,
    isTutorialActive,
    startTutorial,
    endTutorial,
    goToNextStep,
    goToStep,
    tutorialSteps,
    completedSteps,
    markStepAsComplete,
    isStepComplete,
    findDiamondByStockNumber,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}
