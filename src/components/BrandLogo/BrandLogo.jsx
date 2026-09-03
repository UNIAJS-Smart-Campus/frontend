import { useTheme } from "../../context/ThemeContext";

const LOGO_DARK = "/Logo_UAJS.png";
const LOGO_LIGHT = "/Logo_Light_UAJS.png";

function BrandLogo({ className = "", alt = "Logo UAJS Smart Campus" }) {
    const { darkMode } = useTheme();
    const src = darkMode ? LOGO_DARK : LOGO_LIGHT;
    return <img src={src} alt={alt} className={className} />;
}

export default BrandLogo;
