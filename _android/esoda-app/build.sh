#!/bin/bash
set -e
export JAVA_TOOL_OPTIONS=
T=/home/claude/tools
cd /home/claude/app
VC=${VERSION_CODE:-1}; VN=${VERSION_NAME:-1.0}
rm -rf build && mkdir -p build/classes build/gen
$T/aapt2 compile --dir res -o build/res.zip
$T/aapt2 link -o build/base.apk -I $T/android.jar --manifest AndroidManifest.xml \
  --min-sdk-version 24 --target-sdk-version 34 --version-code $VC --version-name $VN \
  --java build/gen build/res.zip
javac -nowarn -Xlint:-options -source 8 -target 8 -encoding UTF-8 -bootclasspath $T/android.jar \
  -d build/classes $(find src build/gen -name '*.java') 2>&1 | grep -v "^Note:" || true
test -f build/classes/gr/giotsorak/esoda/MainActivity.class
java -jar $T/dx.jar --dex --min-sdk-version=24 --output=build/classes.dex build/classes
cp build/base.apk build/unaligned.apk
(cd build && zip -q -j unaligned.apk classes.dex)
python3 $T/zipalign.py build/unaligned.apk build/aligned.apk
java -jar $T/apksigner.jar sign --ks $T/release.jks --ks-pass pass:esoda2026 --key-pass pass:esoda2026 \
  --ks-key-alias esoda --min-sdk-version 24 --out build/EsodaExoda.apk build/aligned.apk
java -jar $T/apksigner.jar verify -v build/EsodaExoda.apk | head -6
ls -la build/EsodaExoda.apk
