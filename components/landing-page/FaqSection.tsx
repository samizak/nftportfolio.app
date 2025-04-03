const faqs = [
  {
    question: "Is my wallet secure when connecting to nftportfolio.app?",
    answer:
      "Yes, we use view-only connections that don't require your private keys or seed phrases. We can only see your NFTs, not move or transfer them.",
  },
  {
    question: "Which blockchains do you support?",
    answer:
      "We currently support Ethereum, Solana, Polygon, Arbitrum, Optimism, and Avalanche. We're constantly adding more chains.",
  },
  {
    question: "How accurate is your pricing data?",
    answer:
      "We aggregate data from multiple sources including major marketplaces, DEXs, and oracles to provide the most accurate pricing possible.",
  },
  {
    question: "Can I track NFTs I don't own?",
    answer:
      "Yes, you can create watchlists to track any NFT collection or specific tokens even if you don't own them.",
  },
  {
    question: "Do you offer tax reporting for NFT transactions?",
    answer:
      "Yes, our Pro and Enterprise plans include tax reporting features that help you track cost basis, gains/losses, and generate reports for tax purposes.",
  },
];

export default function FaqSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32" id="faq">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Everything you need to know about nftportfolio.app.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-3xl gap-4 py-12">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-lg border p-6">
              <h3 className="text-lg font-bold">{faq.question}</h3>
              <p className="mt-2 text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
