
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard as the main landing page
    navigate("/", { replace: true });
  }, [navigate]);

  return null;
}
