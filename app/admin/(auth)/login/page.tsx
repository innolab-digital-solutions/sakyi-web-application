import BrandingPanel from '../../../../components/admin/auth/BrandingPanel';
import LoginFooter from '../../../../components/admin/auth/LoginFooter';
import LoginPanel from '../../../../components/admin/auth/LoginPanel';

export default function AdminLoginPage() {
  return (
    <main className='bg-background relative flex min-h-screen items-center justify-center p-5'>
      {/* Centered container for the login card */}
      <div className='relative z-10 mx-auto w-full max-w-6xl'>
        {/* Card with border, rounded corners, shadow, and glass effect */}
        <div className='bg-background border-border overflow-hidden rounded-lg border p-0 shadow-lg backdrop-blur-xl'>
          {/* Grid layout: BrandingPanel (left), LoginPanel (right) on large screens */}
          <div className='grid min-h-120 grid-cols-1 md:min-h-150 lg:grid-cols-2'>
            <BrandingPanel />

            <LoginPanel />
          </div>
        </div>
      </div>
      {/* Footer displayed at the bottom of the page */}
      <LoginFooter />
    </main>
  );
}
