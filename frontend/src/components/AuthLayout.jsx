const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-indigo-600 mb-1">
              {title}
            </h2>
            <p className="text-gray-600 text-sm">
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