import React from "react";

export default function Help(){
  return (
    <div className="min-h-screen bg-gray-950/80 backdrop-blur-2xl text-gray-100 rounded-3xl">
      
      {/* Header */}
      <div className="bg-gray-900/40 backdrop-blur-2xl text-white py-12 px-6 text-center rounded-t-3xl">
        <h1 className="text-4xl font-bold mb-3">Help & Support</h1>
        <p className="max-w-3xl mx-auto text-lg">
          Learn how CLEAN-INDIA helps in proper waste disposal and how the
          government uses collected waste for a better future.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">

        {/* Why Waste Collection */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-orange-500">
            Why Proper Waste Collection Matters
          </h2>
          <p className="text-gray-100 leading-relaxed">
            Proper waste collection is essential for maintaining public health,
            reducing pollution, and protecting the environment. CLEAN-INDIA
            encourages citizens to dispose of garbage responsibly by connecting
            them with government cleaning vehicles through a secure QR-based
            system.
          </p>
        </section>

        {/* Government Use */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-orange-500">
            How the Government Uses Collected Waste
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            
            <div className="bg-gray-950/60 backdrop-blur-3xl text-white p-6 rounded-xl shadow">
              <h3 className="text-xl font-semibold mb-2">♻️ Waste Segregation</h3>
              <p>
                The collected waste is separated into wet, dry, and hazardous
                waste at processing centers to ensure safe and effective
                treatment.
              </p>
            </div>

            <div className="bg-gray-950/60 backdrop-blur-3xl text-white p-6 rounded-xl shadow">
              <h3 className="text-xl font-semibold mb-2">🌱 Composting</h3>
              <p>
                Organic waste such as food leftovers is converted into compost,
                which is used for agriculture, gardens, and public parks.
              </p>
            </div>

            <div className="bg-gray-950/60 backdrop-blur-3xl text-white p-6 rounded-xl shadow">
              <h3 className="text-xl font-semibold mb-2">🔄 Recycling</h3>
              <p>
                Plastic, paper, metal, and glass waste are sent to recycling
                units where they are reused to create new products.
              </p>
            </div>

            <div className="bg-gray-950/60 backdrop-blur-3xl text-white p-6 rounded-xl shadow">
              <h3 className="text-xl font-semibold mb-2">⚡ Waste to Energy</h3>
              <p>
                Certain types of waste are used to generate electricity and
                biogas, helping reduce dependency on fossil fuels.
              </p>
            </div>

            <div className="bg-gray-950/60 backdrop-blur-3xl text-white p-6 rounded-xl shadow md:col-span-2">
              <h3 className="text-xl font-semibold mb-2">☣️ Hazardous Waste Handling</h3>
              <p>
                Medical and chemical waste is treated separately to prevent
                contamination of soil and water, ensuring public safety.
              </p>
            </div>
          </div>
        </section>

        {/* Citizen Benefits */}
        <section>
          <h2 className="text-2xl mb-4 font-bold text-orange-500">
            Benefits for Citizens
          </h2>
          <div className="list-disc list-inside space-y-2 text-gray-100">
            <div>Earn money for disposing garbage responsibly</div>
            <div>Get reward points based on garbage weight</div>
            <div>Redeem discount coupons and vouchers</div>
            <div>View complete waste disposal history</div>
            <div>Transparent and secure QR-based system</div>
          </div>
        </section>

        {/* Help Section */}
        <section className="bg-white/5 p-8 rounded-xl">
          <h2 className="text-2xl font-semibold mb-3 text-white">
            Need Assistance?
          </h2>
          <p className="mb-4 text-white">
            If you face issues related to registration, QR code scanning,
            rewards, or payments, please contact our support team or reach out to
            your local cleaning vehicle staff.
          </p>
          <p className="font-semibold">
            📧 Email: support@cleanindia.gov  
            <br />
            📞 Helpline: 1800-123-456
          </p>
        </section>

        {/* Footer Quote */}
        <div className="text-center text-gray-200 italic">
          “Clean surroundings reflect a responsible society.”
        </div>

      </div>
    </div>
  );
};

