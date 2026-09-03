interface Props {
    title: string;
}

export default function SectionPlaceholder({ title }: Props) {
    return (
        <section className="app-placeholder">
            <p className="eyebrow">{title}</p>
            <p className="text-muted">This section has not been built yet.</p>
        </section>
    );
}
