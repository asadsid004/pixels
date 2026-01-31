export function Footer() {
    return (
        <footer className="border-t py-6 mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center gap-1">
                    <p className="text-sm text-muted-foreground text-center md:text-left">
                        Built with <span className="text-primary font-medium">Rust</span> + <span className="text-primary font-medium">WebAssembly</span> + <span className="text-primary font-medium">Next.js</span>.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} Pixels. Open Source.
                    </p>
                </div>
            </div>
        </footer>
    );
}
