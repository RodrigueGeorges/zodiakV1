/*
  # Ajout de la table des messages SMS entrants

  1. Nouvelle Table
    - `inbound_messages`
      - `id` (uuid, primary key)
      - `from` (text) - Numéro de l'expéditeur
      - `text` (text) - Contenu du message
      - `timestamp` (timestamptz) - Horodatage du message
      - `user_id` (uuid) - Référence vers le profil utilisateur
      - `created_at` (timestamptz) - Date de création en base

  2. Sécurité
    - Enable RLS
    - Politique de lecture pour les utilisateurs authentifiés
    - Politique d'écriture pour le service uniquement
*/

CREATE TABLE IF NOT EXISTS inbound_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "from" text NOT NULL,
  text text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE inbound_messages ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent lire leurs propres messages
CREATE POLICY "Users can read own messages"
  ON inbound_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Seul le service peut créer des messages
CREATE POLICY "Service can insert messages"
  ON inbound_messages
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Index pour améliorer les performances des requêtes
CREATE INDEX inbound_messages_user_id_idx ON inbound_messages(user_id);
CREATE INDEX inbound_messages_timestamp_idx ON inbound_messages(timestamp DESC);