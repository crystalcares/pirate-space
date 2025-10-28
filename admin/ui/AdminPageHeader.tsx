interface AdminPageHeaderProps {
    title: string;
    description: string;
  }
  const AdminPageHeader = ({ title, description }: AdminPageHeaderProps) => (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-glow">{title}</h1>
      <p className="text-muted-foreground mt-1">{description}</p>
    </div>
  );
  export default AdminPageHeader;
