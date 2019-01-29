# For different .env files in each folders
envfile=".env.filename"

function pathedit {
  str=$0
  str=${str:0:(-11)}
  cp $0 "$0.env"
}

export -f pathedit

find . -name $envfile -exec bash -c "pathedit $0" {} \;
