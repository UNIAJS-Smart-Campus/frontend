const LOGO = "/Logo_Light_UAJS.png";

function BrandLogo({ className = "", alt = "Logo UAJS Smart Campus" }) {
    return <img src={LOGO} alt={alt} className={className} />;
}

export default BrandLogo;
