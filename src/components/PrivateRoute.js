import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { pathNameBaseOnStage } from '../services/configHandle';

const PrivateRoute = ({ children }) => {

  const router = useRouter();
  const { token, role } = useSelector((state) => state.user);

  const isAuthenticated = token ? true : false
  const isAdmin = role == "admin" ? true : false

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(pathNameBaseOnStage('/login'));
    } else {
      if (router.pathname.includes("admin")) {
        if (!isAdmin) {
          router.push(pathNameBaseOnStage("/admin/404"));
        }
      } else if (router.pathname.includes("user")) {
        if (isAdmin) {
          router.push(pathNameBaseOnStage("/user/404"));
        }
      }
    }
  }, [isAuthenticated, router]);

  return isAuthenticated ? children : null;
};

export default PrivateRoute;