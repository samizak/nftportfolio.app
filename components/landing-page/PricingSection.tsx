import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const tiers = [
  {
    name: "Free",
    description: "Perfect for beginners exploring NFTs",
    price: "$0",
    features: [
      "Track up to 100 NFTs",
      "Basic analytics",
      "Connect 2 wallets",
      "Daily price updates",
    ],
    isPopular: false,
    buttonText: "Get Started",
    buttonVariant: "outline",
  },
  {
    name: "Pro",
    description: "For serious collectors and investors",
    price: "$19",
    features: [
      "Unlimited NFTs",
      "Advanced analytics",
      "Connect 5 wallets",
      "Real-time price updates",
      "Price alerts",
      "Portfolio performance reports",
    ],
    isPopular: true,
    buttonText: "Get Started",
    buttonVariant: "default",
  },
  {
    name: "Enterprise",
    description: "For professional traders and funds",
    price: "$49",
    features: [
      "Everything in Pro",
      "Unlimited wallets",
      "API access",
      "Advanced market insights",
      "Dedicated support",
      "Custom reporting",
    ],
    isPopular: false,
    buttonText: "Contact Sales",
    buttonVariant: "outline",
  },
];

export default function PricingSection() {
  return (
    <section
      className="w-full py-12 md:py-24 lg:py-32 bg-muted/50"
      id="pricing"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Choose the plan that's right for your NFT portfolio size and
              needs.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3 items-start">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-lg border bg-background p-6 ${
                tier.isPopular ? "shadow-lg ring-2 ring-primary" : ""
              }`}
            >
              <div className="space-y-2">
                {tier.isPopular && (
                  <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold">{tier.name}</h3>
                <p className="text-muted-foreground h-10">{tier.description}</p>
              </div>
              <div className="mt-4 flex items-baseline text-3xl font-bold">
                {tier.price}
                <span className="ml-1 text-base font-medium text-muted-foreground">
                  /month
                </span>
              </div>
              <ul className="mt-6 space-y-3 flex-grow">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-8 w-full"
                variant={tier.buttonVariant as any}
              >
                {tier.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
