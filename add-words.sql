-- Add new filtered words with 3 warnings for mute and 5 warnings for ban

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'chutiya', 'profanity', true, true, true, true, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'chutiya');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'madherchod', 'profanity', true, true, true, true, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'madherchod');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'bc', 'profanity', true, true, true, true, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'bc');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'mc', 'profanity', true, true, true, true, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'mc');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'randi', 'profanity', true, true, true, true, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'randi');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'raand', 'profanity', true, true, true, true, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'raand');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'rand', 'profanity', true, true, true, true, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'rand');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'kamina', 'profanity', true, true, true, true, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'kamina');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'bsdk', 'profanity', true, true, true, true, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'bsdk');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'bhosdi', 'profanity', true, true, true, true, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'bhosdi');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'chakka', 'profanity', true, true, true, true, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'chakka');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'teri maa ki', 'profanity', true, true, true, true, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'teri maa ki');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'laand', 'profanity', true, true, true, true, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'laand');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'lund', 'profanity', true, true, true, true, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'lund');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'bur', 'profanity', true, true, true, true, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'bur');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'bahanchod', 'profanity', true, true, true, true, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'bahanchod');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'burchodi', 'profanity', true, true, true, true, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'burchodi');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'behenchod', 'profanity', true, true, true, true, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'behenchod');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'bhnchod', 'profanity', true, true, true, true, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'bhnchod');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'bhenchod', 'profanity', true, true, true, true, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'bhenchod');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'gay', 'profanity', true, true, true, true, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'gay');

INSERT INTO filtered_words (word, category, delete_message, warn_user, auto_mute, auto_ban, warnings_before_mute, warnings_before_ban)
SELECT 'dogla', 'profanity', true, true, true, true, 3, 5
WHERE NOT EXISTS (SELECT 1 FROM filtered_words WHERE word = 'dogla');