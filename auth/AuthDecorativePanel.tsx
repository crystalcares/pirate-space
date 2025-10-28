const AuthDecorativePanel = () => {
    return (
      <div className="hidden lg:block relative h-full">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{backgroundImage: "url('https://images.unsplash.com/photo-1554147090-e1221a04a025?q=80&w=2070&auto=format&fit=crop')"}}
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
    );
  };
  export default AuthDecorativePanel;
