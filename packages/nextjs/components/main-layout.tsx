import { cn } from "@/lib/utils";
import { Title, TitleProps } from "./ui/title";

function MainLayout({
    children,
    className,
    ...props
}: React.PropsWithChildren<React.ComponentProps<"div">>) {
    return (
        <div {...props} className={cn("space-y-4 p-4 md:p-6", className)}>
            {children}
        </div>
    );
}
function MainLayoutTitleSearchContainer({
    children,
    className,
    ...props
}: React.PropsWithChildren<React.ComponentProps<"div">>) {
    return (
        <div
            {...props}
            className="flex space-y-4 md:space-y-0 flex-col  md:flex-row  md:justify-between"
        >
            {children}
        </div>
    );
}

function MainLayoutTitle({
    children,
    ...props
}: React.PropsWithChildren<Omit<TitleProps, "size" | "as">>) {
    return <Title {...props}>{children}</Title>;
}

function MainLayoutSubTitle({
    children,
    ...props
}: React.PropsWithChildren<Omit<TitleProps, "">>) {
    return (
        <Title size="md" as="h2" {...props}>
            {children}
        </Title>
    );
}

function MainLayoutSection({
    children,
    ...props
}: React.PropsWithChildren<React.ComponentProps<"section">>) {
    return (
        <section className=" pt-2" {...props}>
            {children}
        </section>
    );
}

function MainLayoutDescription({
    children,
    className,
    ...props
}: React.PropsWithChildren<React.ComponentProps<"p">>) {
    return (
        <p className={cn("text-muted-foreground", className)} {...props}>
            {children}
        </p>
    );
}

export {
    MainLayout,
    MainLayoutDescription,
    MainLayoutSection,
    MainLayoutSubTitle,
    MainLayoutTitle,
    MainLayoutTitleSearchContainer,
};
