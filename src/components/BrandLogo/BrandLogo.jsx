// El logo se muestra siempre sobre fondos oscuros: la barra lateral, el
// panel del login y la cabecera del landing son azul marino en el tema
// claro y casi negro en el oscuro. Por eso se usa siempre la versión
// clara (blanca): con la variante azul marino el logo se perdía en el
// modo oscuro.
const LOGO_CLARO = "/Logo_Light_UAJS.png";

function BrandLogo({ className = "", alt = "Logo UAJS Smart Campus" }) {
    return <img src={LOGO_CLARO} alt={alt} className={className} />;
}

export default BrandLogo;
