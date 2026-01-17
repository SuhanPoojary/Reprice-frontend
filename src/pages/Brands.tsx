import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Brands() {
  const navigate = useNavigate();
  const { brandId } = useParams();

  useEffect(() => {
    navigate("/sell", {
      replace: true,
      state: {
        tab: "brands",
        brandId,
      },
    });
  }, [brandId, navigate]);

  return null;
}
