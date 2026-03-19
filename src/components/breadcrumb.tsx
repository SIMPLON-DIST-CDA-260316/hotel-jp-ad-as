// Pas de "use client" car composant statique, pas d'interactivité

// Link est le composant Next.js pour la navigation interne, plus performant que la balise <a> classique
import Link from "next/link";

// On définit la forme d'un élément du breadcrumb
// Chaque élément a obligatoirement un label (texte affiché) et un href (lien)
type BreadcrumbItem = {
  label: string; // ex: "Accueil"
  href: string;  // ex: "/"
};

// On définit les props du composant
// Le composant reçoit un tableau d'éléments BreadcrumbItem
type Props = {
  items: BreadcrumbItem[]; // [] veut dire "tableau de"
};

// export default rend le composant disponible pour être importé ailleurs
// { items } : on extrait directement items des props (destructuration)
// : Props : on dit à TypeScript que les props doivent correspondre au type Props
export default function Breadcrumb({ items }: Props) {
  return (
    <nav className="flex items-center gap-2 text-sm text-foreground/60 mb-6">

      {/* .map() parcourt chaque élément du tableau et le transforme en HTML */}
      {/* item = l'élément actuel, index = sa position dans le tableau (0, 1, 2...) */}
      {items.map((item, index) => {

        // On vérifie si c'est le dernier élément du tableau
        // items.length = nombre total d'éléments
        // items.length - 1 = index du dernier élément (les index commencent à 0)
        // isLast vaut true ou false
        const isLast = index === items.length - 1;

        return (
          // key : obligatoire avec .map() pour que React identifie chaque élément
          // on utilise item.href car chaque lien est unique
          <span key={item.href} className="flex items-center gap-2">

            {/* Ternaire : condition ? si vrai : si faux */}
            {/* Si c'est le dernier élément → non cliquable */}
            {/* Si ce n'est pas le dernier → cliquable avec Link */}
            {isLast ? (
              // Dernier élément : non cliquable
              <span className="text-foreground font-medium">{item.label}</span>
            ) : (
              // Autres éléments : lien cliquable
              <Link href={item.href} className="hover:text-icon transition-colors">
                {item.label}
              </Link>
            )}

            {/* !isLast : si ce n'est PAS le dernier élément */}
            {/* && : alors affiche ce qui suit */}
            {/* › : le caractère séparateur */}
            {!isLast && <span className="text-icon">›</span>}

          </span>
        );
      })}

    </nav>
  );
}