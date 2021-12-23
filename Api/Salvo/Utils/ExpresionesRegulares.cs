using System.Text.RegularExpressions;

namespace Salvo.Utils
{
    public static class ExpresionesRegulares
    {
        public static bool IsValidPassword(string input, out string ErrorMessage)
        {
            ErrorMessage = string.Empty;
            var hasNumber = new Regex(@"[0-9]+");
            var hasUpperChar = new Regex(@"[A-Z]+");
            var hasMiniMaxChars = new Regex(@".{6}");
            var hasLowerChar = new Regex(@"[a-z]+");

            if (!hasLowerChar.IsMatch(input))
            {
                ErrorMessage = "La contraseña debe contener al menos una letra en minuscula";

                return false;
            }
            else if (!hasUpperChar.IsMatch(input))
            {
                ErrorMessage = "La contraseña debe contener al menos una letra en mayuscula";

                return false;
            }
            else if (!hasMiniMaxChars.IsMatch(input))
            {
                ErrorMessage = "La contraseña debe tener un minimo de 6 caracteres";
                return false;
            }
            else if (!hasNumber.IsMatch(input))
            {
                ErrorMessage = "La contraseña debe contener al menos caracter numerico";
                return false;
            }
            else
            {
                return true;
            }
        }

        public static bool IsValidEmail(string input)
        {
            var hasSymbols = new Regex(@"^([\w.-]+)@([\w-]+)((.(\w){2,3})+)$");

            if (!hasSymbols.IsMatch(input))
            {
                return false;
            }
            else
            {
                return true;
            }
        }
    }
}
