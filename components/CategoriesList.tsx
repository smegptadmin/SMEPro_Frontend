import { useEffect, useState } from "react";

function CategoriesList() {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/categories")
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  return (
    <ul>
      {categories.map((cat, idx) => (
        <li key={idx}>{cat}</li>
      ))}
    </ul>
  );
}

export default CategoriesList;
