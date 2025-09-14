"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Plus, Edit2, User, Wallet, HelpCircle, LogOut, TrendingUp, Users, DollarSign, BarChart3, Eye, MapPin, Calendar, Filter, Loader, Menu, X, ChevronLeft, ChevronRight, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AgencyLayoutProps {
  children: React.ReactNode;
}

export default function AgencyLayout({ children }: AgencyLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userData, setUserData] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { apiService } = await import('@/lib/api');
      
      if (apiService.isAuthenticated()) {
        const response = await apiService.getUserProfile();
        if (response.success && response.user) {
          // Validate user type for agency dashboard access
          if (response.user.user_type === "agency" || response.user.user_type === "agency_admin") {
            setUserData(response.user);
            localStorage.setItem('user', JSON.stringify(response.user));
          } else {
            // Unauthorized user type - clear tokens and redirect
            console.log('Unauthorized user type for agency dashboard:', response.user.user_type);
            apiService.clearAuthTokens();
            if (response.user.user_type === "client") {
              router.push('/client-dashboard');
            } else {
              router.push('/auth/login');
            }
            return;
          }
        }
      } else {
        // Fallback to localStorage with validation
        const localUserData = localStorage.getItem('user');
        if (localUserData) {
          const parsedUser = JSON.parse(localUserData);
          // Validate user type before using cached data
          if (parsedUser.user_type === "agency" || parsedUser.user_type === "agency_admin") {
            setUserData(parsedUser);
          } else {
            // Invalid user type in cache - clear and redirect
            console.log('Invalid cached user type for agency dashboard:', parsedUser.user_type);
            localStorage.removeItem('user');
            if (parsedUser.user_type === "client") {
              router.push('/client-dashboard');
            } else {
              router.push('/auth/login');
            }
            return;
          }
        } else {
          // No user data available - redirect to login
          router.push('/auth/login');
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      // Clear potentially corrupted data and redirect
      const { apiService } = await import('@/lib/api');
      apiService.clearAuthTokens();
      router.push('/auth/login');
    }
  };

  const handleLogout = async () => {
    try {
      const { apiService } = await import('@/lib/api');
      await apiService.logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
      const { apiService } = await import('@/lib/api');
      apiService.clearAuthTokens();
      router.push('/auth/login');
    }
  };

  const handleCreateCampaign = () => {
    if (userData?.agency?.is_profile_complete === false) {
      // Show modal or redirect to settings
      router.push('/settings');
      return;
    }
    router.push("/campaigns/create");
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3
    },
    {
      name: 'Campaigns',
      href: '/campaigns',
      icon: Megaphone
    },
    {
      name: 'Clients',
      href: '/clients',
      icon: Users
    },
    {
      name: 'Wallet',
      href: '/wallet',
      icon: Wallet
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User
    }
  ];

  const bottomNavigation = [
    {
      name: 'Help and support',
      href: '/help',
      icon: HelpCircle
    }
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${isCollapsed ? 'w-16' : 'w-64'} min-h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex-shrink-0 hidden lg:block`}>
        <div className="p-4">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <img 
                  src="/stika_1.svg" 
                  alt="Stika" 
                  className="w-12 h-12"
                />
                <span className="text-xl font-bold text-purple-800">
                  Stika
                </span>
              </div>
            )}
            {isCollapsed && (
              <img 
                src="/stika_1.svg" 
                alt="Stika" 
                className="w-8 h-8 mx-auto"
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-1 h-8 w-8"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);
              
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'text-white bg-purple-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.name : ''}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </a>
              );
            })}
          </nav>

          {/* Bottom Navigation */}
          <div className={`mt-auto ${isCollapsed ? 'pt-16' : 'pt-20'}`}>
            <div className="space-y-2">
              {bottomNavigation.map((item) => {
                const Icon = item.icon;
                
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors duration-200 ${
                      isCollapsed ? 'justify-center' : ''
                    }`}
                    title={isCollapsed ? item.name : ''}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </a>
                );
              })}
              
              <button
                onClick={handleLogout}
                className={`flex items-center gap-3 px-3 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg w-full text-left transition-colors duration-200 cursor-pointer ${
                  isCollapsed ? 'justify-center' : ''
                }`}
                title={isCollapsed ? 'Logout' : ''}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={closeMobileMenu}></div>
          <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-[60] shadow-xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <img 
                    src="/stika_1.svg" 
                    alt="Stika" 
                    className="w-12 h-12"
                  />
                  <span className="text-xl font-bold text-purple-800">
                    Stika
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeMobileMenu}
                  className="p-1 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.href);
                  
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-colors ${
                        isActive
                          ? 'text-white bg-purple-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </a>
                  );
                })}
              </nav>

              <div className="mt-auto pt-16">
                <div className="space-y-2">
                  {bottomNavigation.map((item) => {
                    const Icon = item.icon;
                    
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 px-3 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors duration-200"
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </a>
                    );
                  })}
                  
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-3 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg w-full text-left transition-colors duration-200 cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {pathname === '/dashboard' && 'Overview'}
                  {pathname === '/campaigns' && 'Campaigns'}
                  {pathname === '/clients' && 'Client Management'}
                  {pathname === '/profile' && 'Profile'}
                  {pathname === '/help' && 'Help & Support'}
                  {pathname === '/settings' && 'Settings'}
                  {pathname === '/wallet' && 'Wallet'}
                  {pathname.startsWith('/campaigns/') && 'Campaign Details'}
                </h1>
                <p className="text-gray-600 hidden sm:block">
                  Welcome {userData?.full_name || userData?.username || 'User'}.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <Button 
                onClick={handleCreateCampaign} 
                className="bg-purple-600 hover:bg-purple-700"
                size={typeof window !== 'undefined' && window.innerWidth < 640 ? "sm" : "default"}
              >
                <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Create campaign</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}