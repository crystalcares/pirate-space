import React from 'react';
import { Link } from 'react-router-dom';
import { PirateLogo } from '../ui/logo-icon';
import AuthDecorativePanel from './AuthDecorativePanel';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
        <div className="flex items-center justify-center py-12">
          <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
              <Link to="/" className="flex justify-center items-center gap-3 mb-4">
                <PirateLogo />
              </Link>
            </div>
            {children}
          </div>
        </div>
        <AuthDecorativePanel />
      </div>
    </>
  );
};

export default AuthLayout;
