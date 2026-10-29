# Έσοδα & Έξοδα — εφαρμογή Android (native Java, χωρίς βιβλιοθήκες)

Τα δεδομένα μένουν τοπικά στο κινητό (SQLite). Δεν υπάρχουν προσωπικά δεδομένα σε αυτόν τον φάκελο.

## Ενημερώσεις
Η εφαρμογή διαβάζει το https://comfystay.gr/esoda/version.json. Όταν το `versionCode` είναι μεγαλύτερο
από της εγκατεστημένης, κατεβάζει το `esoda/EsodaExoda.apk` και το εγκαθιστά από πάνω (τα δεδομένα μένουν).

Για νέα έκδοση: build με μεγαλύτερο `VERSION_CODE`, αντιγραφή του APK στο `esoda/`, αύξηση `versionCode` στο `version.json`.
Το APK πρέπει να υπογράφεται ΠΑΝΤΑ με το ίδιο κλειδί (release.jks — δεν ανεβαίνει εδώ, το κρατάει ο ιδιοκτήτης).

Build: `VERSION_CODE=2 VERSION_NAME=1.1 ./build.sh` (aapt2, javac, dx, apksigner).

Ο φάκελος ξεκινά με `_` ώστε το GitHub Pages να μην τον δημοσιεύει.
