
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ReactNode } from "react";
import { Zap, Shield, Sparkles } from "lucide-react";

// Lucide icons don't accept 'strokeWidth' generally as a prop in the same way, but standard className sizing works.

const FEATURES_DATA = [
    {
        title: "Native Speed",
        description:
            "Powered by Rust and WebAssembly to deliver image processing speeds that rival native desktop applications.",
        Icon: <Zap className="size-6" />,
    },
    {
        title: "Privacy First",
        description:
            "Your photos never leave your device. All processing happens locally in your browser, ensuring 100% privacy.",
        Icon: <Shield className="size-6" />,
    },
    {
        title: "Pro Filters",
        description:
            "Access professional grade color grading, filters, and effects. Fine-tune every aspect of your image.",
        Icon: <Sparkles className="size-6" />,
    },
];

export default function Features() {
    return (
        <section className="py-18">
            <div className="@container mx-auto max-w-7xl px-6">
                <div className="text-center">
                    <h2 className="text-4xl font-medium text-balance lg:text-5xl">
                        Image editing reimagined
                    </h2>
                    <p className="text-muted-foreground mx-auto mt-4 max-w-2xl">
                        Pixels combines the raw performance of low-level systems programming
                        with the accessibility of the modern web.
                    </p>
                </div>
                <div className="mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16 md:max-w-none md:grid-cols-3">
                    {FEATURES_DATA.map((feature) => (
                        <FeatureCard key={feature.title} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function FeatureCard({
    title,
    description,
    Icon,
}: {
    title: string;
    description: string;
    Icon: React.ReactNode;
}) {
    return (
        <Card className="group hover:bg-muted/5 rounded-md shadow-none border transition-all">
            <CardHeader>
                <CardDecorator>{Icon}</CardDecorator>
                <h3 className="text-lg font-medium">{title}</h3>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
    <div className="relative mx-auto size-36 mask-radial-from-40% mask-radial-to-60% duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
        <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[24px_24px] dark:opacity-50"
        />

        <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-t border-l shadow-sm">
            {children}
        </div>
    </div>
);