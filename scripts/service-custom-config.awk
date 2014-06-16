#!/usr/bin/env awk -f

BEGIN {
    clientIndent = "            ";
    printed = "false"
}

/deployedTiers/ {
    print;
    printf("%s    \"services\",\n", clientIndent);
    printf("%s    \"database\"\n", clientIndent);
    while ($0 !~ /]/) {
	getline
    }
}

printed == "false" { print }

{ printed = "false" }
