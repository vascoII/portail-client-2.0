"use client";
import React, { useState } from "react";

interface ReleveFormData {
  numeroImmeuble: string;
  batiment: string;
  escalier: string;
  etage: string;
  datePassage: string;

  prenom: string;
  nom: string;
  adresse: string;
  codePostal: string;
  ville: string;
  telephone: string;
  email: string;

  cuisine_ef_num: string;
  cuisine_ef: number;
  salleDeBains_ef_num: string;
  salleDeBains_ef: number;
  wc_ef_num: string;
  wc_ef: number;
  autreEmplacement_ef_loc: string;
  autreEmplacement_ef_num: string;
  autreEmplacement_ef: number;

  cuisine_ec_num: string;
  cuisine_ec: number;
  salleDeBains_ec_num: string;
  salleDeBains_ec: number;
  wc_ec_num: string;
  wc_ec: number;
  autreEmplacement_ec_loc: string;
  autreEmplacement_ec_num: string;
  autreEmplacement_ec: number;
}

interface ReleveFormProps {
  onSubmit: (data: ReleveFormData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  success?: boolean;
}

const ReleveForm: React.FC<ReleveFormProps> = ({ onSubmit, loading = false, error, success }) => {
  const [formData, setFormData] = useState<ReleveFormData>({
    numeroImmeuble: "",
    batiment: "",
    escalier: "",
    etage: "",
    datePassage: "",

    prenom: "",
    nom: "",
    adresse: "",
    codePostal: "",
    ville: "",
    telephone: "",
    email: "",

    cuisine_ef_num: "",
    cuisine_ef: 0,
    salleDeBains_ef_num: "",
    salleDeBains_ef: 0,
    wc_ef_num: "",
    wc_ef: 0,
    autreEmplacement_ef_loc: "",
    autreEmplacement_ef_num: "",
    autreEmplacement_ef: 0,

    cuisine_ec_num: "",
    cuisine_ec: 0,
    salleDeBains_ec_num: "",
    salleDeBains_ec: 0,
    wc_ec_num: "",
    wc_ec: 0,
    autreEmplacement_ec_loc: "",
    autreEmplacement_ec_num: "",
    autreEmplacement_ec: 0,
  });

  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof ReleveFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.type === "number" ? Number(value) : value,
    }));
    if (validationErrors[name as keyof ReleveFormData]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ReleveFormData, string>> = {};
    if (!formData.numeroImmeuble.trim()) errors.numeroImmeuble = "Champ requis";
    if (!formData.datePassage.trim()) errors.datePassage = "Champ requis";
    if (!formData.prenom.trim()) errors.prenom = "Champ requis";
    if (!formData.nom.trim()) errors.nom = "Champ requis";
    if (!formData.adresse.trim()) errors.adresse = "Champ requis";
    if (!formData.codePostal.trim()) errors.codePostal = "Champ requis";
    if (!formData.ville.trim()) errors.ville = "Champ requis";
    if (!formData.telephone.trim()) errors.telephone = "Champ requis";
    if (!formData.email.trim()) errors.email = "Champ requis";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error("Erreur lors de l'envoi du relevé :", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">Votre relevé a été envoyé avec succès.</div>}

      {/* Section 1 : Immeuble */}
      <fieldset>
        <legend className="font-bold">Informations Immeuble</legend>
        <input name="numeroImmeuble" placeholder="N° Immeuble *" value={formData.numeroImmeuble} onChange={handleChange} />
        <input name="batiment" placeholder="Bâtiment" value={formData.batiment} onChange={handleChange} />
        <input name="escalier" placeholder="Escalier" value={formData.escalier} onChange={handleChange} />
        <input name="etage" placeholder="Étage" value={formData.etage} onChange={handleChange} />
        <input name="datePassage" placeholder="Date de passage *" value={formData.datePassage} onChange={handleChange} />
      </fieldset>

      {/* Section 2 : Occupant */}
      <fieldset>
        <legend className="font-bold">Informations Occupant</legend>
        <input name="prenom" placeholder="Prénom *" value={formData.prenom} onChange={handleChange} />
        <input name="nom" placeholder="Nom *" value={formData.nom} onChange={handleChange} />
        <input name="adresse" placeholder="Adresse *" value={formData.adresse} onChange={handleChange} />
        <input name="codePostal" placeholder="Code Postal *" value={formData.codePostal} onChange={handleChange} />
        <input name="ville" placeholder="Ville *" value={formData.ville} onChange={handleChange} />
        <input name="telephone" placeholder="Téléphone *" value={formData.telephone} onChange={handleChange} />
        <input name="email" placeholder="Email *" value={formData.email} onChange={handleChange} />
      </fieldset>

      {/* Section 3 : Compteurs Eau Froide */}
      <fieldset>
        <legend className="font-bold">Compteurs Eau Froide</legend>
        <input name="cuisine_ef_num" placeholder="Cuisine - N° compteur" value={formData.cuisine_ef_num} onChange={handleChange} />
        <input name="cuisine_ef" type="number" placeholder="Cuisine - m³" value={formData.cuisine_ef} onChange={handleChange} />
        <input name="salleDeBains_ef_num" placeholder="Salle de bains - N° compteur" value={formData.salleDeBains_ef_num} onChange={handleChange} />
        <input name="salleDeBains_ef" type="number" placeholder="Salle de bains - m³" value={formData.salleDeBains_ef} onChange={handleChange} />
        <input name="wc_ef_num" placeholder="WC - N° compteur" value={formData.wc_ef_num} onChange={handleChange} />
        <input name="wc_ef" type="number" placeholder="WC - m³" value={formData.wc_ef} onChange={handleChange} />
        <input name="autreEmplacement_ef_loc" placeholder="Autre emplacement - Localisation" value={formData.autreEmplacement_ef_loc} onChange={handleChange} />
        <input name="autreEmplacement_ef_num" placeholder="Autre emplacement - N° compteur" value={formData.autreEmplacement_ef_num} onChange={handleChange} />
        <input name="autreEmplacement_ef" type="number" placeholder="Autre emplacement - m³" value={formData.autreEmplacement_ef} onChange={handleChange} />
      </fieldset>

      {/* Section 4 : Compteurs Eau Chaude */}
      <fieldset>
        <legend className="font-bold">Compteurs Eau Chaude</legend>
        <input name="cuisine_ec_num" placeholder="Cuisine - N° compteur" value={formData.cuisine_ec_num} onChange={handleChange} />
        <input name="cuisine_ec" type="number" placeholder="Cuisine - m³" value={formData.cuisine_ec} onChange={handleChange} />
        <input name="salleDeBains_ec_num" placeholder="Salle de bains - N° compteur" value={formData.salleDeBains_ec_num} onChange={handleChange} />
        <input name="salleDeBains_ec" type="number" placeholder="Salle de bains - m³" value={formData.salleDeBains_ec} onChange={handleChange} />
        <input name="wc_ec_num" placeholder="WC - N° compteur" value={formData.wc_ec_num} onChange={handleChange} />
        <input name="wc_ec" type="number" placeholder="WC - m³" value={formData.wc_ec} onChange={handleChange} />
        <input name="autreEmplacement_ec_loc" placeholder="Autre emplacement - Localisation" value={formData.autreEmplacement_ec_loc} onChange={handleChange} />
        <input name="autreEmplacement_ec_num" placeholder="Autre emplacement - N° compteur" value={formData.autreEmplacement_ec_num} onChange={handleChange} />
        <input name="autreEmplacement_ec" type="number" placeholder="Autre emplacement - m³" value={formData.autreEmplacement_ec} onChange={handleChange} />
      </fieldset>

      <button type="submit" disabled={loading}>
        {loading ? "Envoi en cours..." : "Envoyer"}
      </button>
    </form>
  );
};

export default ReleveForm;