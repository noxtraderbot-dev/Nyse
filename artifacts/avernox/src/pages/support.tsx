import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShieldAlert, HelpCircle, ArrowRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Support() {
  const issues = [
    {
      q: "My deposit hasn't appeared in my balance",
      a: "Cryptocurrency deposits require network confirmations before they are credited to your account. Bitcoin requires 3 confirmations, while Ethereum and Solana require specific block heights. Please ensure you sent the correct asset to the exact address provided. If you still face the same issue contact @AverAssistancebot on Telegram."
    },
    {
      q: "Why is my withdrawal status 'Reversed'?",
      a: "Withdrawals may be reversed by our security systems for several reasons: attempting to withdraw to a cold wallet (hardware wallet), incomplete identity verification, or network congestion. For security during active quantum trading, only verified hot wallets are permitted. If you still face the same issue contact @AverAssistancebot."
    },
    {
      q: "How does identity verification work?",
      a: "To comply with institutional-grade security protocols, withdrawals require identity verification via our Telegram assistance bot. You must provide picture proof of authenticity as requested. Only pictures are accepted. If you still face the same issue contact @AverAssistancebot."
    },
    {
      q: "The live tracker shows a loss. Is this normal?",
      a: "Yes. Our quantum models execute thousands of micro-trades. While the system is engineered for overall positive returns, individual trades will naturally incur losses. The system optimizes for net profitability over the investment duration."
    },
    {
      q: "How do I upgrade my account tier?",
      a: "Account tiers are automatically upgraded by the system based on total volume traded and portfolio balance. Institutional tiers require manual verification. If you still face the same issue contact @AverAssistancebot."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Support Center</h2>
          <p className="text-sm text-muted-foreground">Knowledge base and technical assistance.</p>
        </div>
        <Button className="font-bold tracking-widest text-xs" onClick={() => window.open('https://t.me/AverAssistancebot', '_blank')}>
          <MessageSquare className="w-4 h-4 mr-2" />
          CONTACT SUPPORT
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" /> Common Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {issues.map((issue, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border-border/50">
                    <AccordionTrigger className="text-left font-bold text-sm hover:text-primary transition-colors">
                      {issue.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-2 pb-4">
                      {issue.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/50 border-border backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-16 bg-primary/5 rounded-full blur-[50px] pointer-events-none" />
            <CardContent className="p-6 space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <ShieldAlert className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg">Direct Assistance</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our automated assistance module handles verification, security holds, and account issues 24/7.
              </p>
              <div className="pt-4">
                <a href="https://t.me/AverAssistancebot" target="_blank" rel="noreferrer" className="flex items-center text-sm font-bold text-primary hover:underline group">
                  @AverAssistancebot
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </a>
                <p className="text-[10px] text-muted-foreground mt-2 font-mono">Platform telegram support module</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/20 border-border/50">
            <CardContent className="p-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">System Notice</h4>
              <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
                AverNox personnel will never ask for your password, private keys, or seed phrases. Any entity claiming to represent AverNox asking for these details should be reported immediately.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
