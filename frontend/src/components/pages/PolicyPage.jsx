import {
  ShieldCheck,
  FileText,
  RefreshCcw,
  Truck,
  Ban,
  Mail,
} from "lucide-react";

const policies = [
  {
    title: "Privacy Policy",
    icon: ShieldCheck,
    description:
      "We respect your privacy and protect your personal information. Your data is used only to process orders, improve our services, and provide a secure food ordering experience.",
  },
  {
    title: "Terms & Conditions",
    icon: FileText,
    description:
      "By using our platform, you agree to our terms regarding ordering, payments, account security, and acceptable use of our services.",
  },
  {
    title: "Refund Policy",
    icon: RefreshCcw,
    description:
      "Refunds are available for eligible cancelled or failed orders. Approved refunds are processed within 5–7 business days.",
  },
  {
    title: "Delivery Policy",
    icon: Truck,
    description:
      "Delivery times depend on restaurant preparation and traffic conditions. We strive to deliver every order fresh and on time.",
  },
  {
    title: "Cancellation Policy",
    icon: Ban,
    description:
      "Orders may be cancelled before the restaurant begins preparing your meal. Once preparation starts, cancellation may not be possible.",
  },
];

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-orange-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-400 via-orange-400 to-orange-400 text-white">
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Our Policies
          </h1>

          <p className="text-lg text-orange-100 max-w-3xl mx-auto">
            We are committed to transparency, security, and providing the best
            food delivery experience for every customer.
          </p>
        </div>
      </section>

      {/* Policy Cards */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {policies.map((policy, index) => {
            const Icon = policy.icon;

            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border border-orange-100 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-6">
                  <Icon size={30} className="text-orange-400" />
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {policy.title}
                </h2>

                <p className="text-gray-600 leading-7">
                  {policy.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-orange-400 rounded-3xl p-10 text-center text-white shadow-xl">
          <Mail className="mx-auto mb-5" size={42} />

          <h2 className="text-3xl font-bold mb-4">
            Have Questions?
          </h2>

          <p className="text-orange-100 mb-6">
            If you have any questions regarding our policies or your order,
            our support team is always ready to help.
          </p>

          <button className="bg-white text-orange-600 font-semibold px-8 py-3 rounded-full hover:bg-orange-100 transition">
            support@foodexpress.com
          </button>
        </div>
      </section>
    </div>
  );
}