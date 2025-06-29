/*
  # Amélioration de la gestion des messages entrants

  1. Nouvelles Colonnes
    - `status` (text) - Statut du message (reçu, traité, erreur)
    - `metadata` (jsonb) - Métadonnées additionnelles du message
    - `error` (text) - Message d'erreur éventuel
    - `processed_at` (timestamptz) - Date de traitement

  2. Fonctions
    - Fonction pour marquer un message comme traité
    - Fonction pour gérer les erreurs de traitement

  3. Index
    - Index sur le statut pour optimiser les requêtes de filtrage
*/

-- Ajout des nouvelles colonnes
ALTER TABLE inbound_messages 
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'received',
  ADD COLUMN IF NOT EXISTS metadata jsonb,
  ADD COLUMN IF NOT EXISTS error text,
  ADD COLUMN IF NOT EXISTS processed_at timestamptz;

-- Contrainte sur les valeurs possibles du statut
ALTER TABLE inbound_messages 
  ADD CONSTRAINT inbound_messages_status_check 
  CHECK (status IN ('received', 'processed', 'error'));

-- Index sur le statut
CREATE INDEX IF NOT EXISTS inbound_messages_status_idx ON inbound_messages(status);

-- Fonction pour marquer un message comme traité
CREATE OR REPLACE FUNCTION mark_message_processed(
  message_id uuid,
  metadata_json jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE inbound_messages
  SET 
    status = 'processed',
    metadata = metadata_json,
    processed_at = now()
  WHERE id = message_id;
END;
$$;

-- Fonction pour marquer un message en erreur
CREATE OR REPLACE FUNCTION mark_message_error(
  message_id uuid,
  error_message text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE inbound_messages
  SET 
    status = 'error',
    error = error_message,
    processed_at = now()
  WHERE id = message_id;
END;
$$;

-- Mise à jour de la politique de sélection pour inclure les nouveaux champs
DROP POLICY IF EXISTS "Users can read own messages" ON inbound_messages;
CREATE POLICY "Users can read own messages"
  ON inbound_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);