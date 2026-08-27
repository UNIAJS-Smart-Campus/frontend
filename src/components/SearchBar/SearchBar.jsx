import Button from "../Button/Button";
import Input from "../Input/Input";
import "./SearchBar.css";

function SearchBar({
    value,
    onChange,
    placeholder,
    id,
    buttonText = "Buscar"
}) {
    return (
        <form
            className="searchbar"
            role="search"
            onSubmit={(e) => e.preventDefault()}
        >
            <div className="searchbar__field">
                <Input
                    type="search"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    id={id}
                />
            </div>

            <Button variant="primary" type="submit" size="md">
                {buttonText}
            </Button>
        </form>
    );
}

export default SearchBar;