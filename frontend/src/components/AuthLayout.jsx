const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#111827] mb-1">
              {title}
            </h2>
            <p className="text-sm text-[#6B7280]">
              {subtitle}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;