# For different .env files in each folders
envfile=".env.sample"

function pathedit {
  str=$0
  str=${str:0:(-11)}
  cp $0 "$str.env"
}

export -f pathedit

find . -name $envfile -exec bash -c "pathedit $0" {} \;
