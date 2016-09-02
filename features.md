- Voir l'état de tous les programmes décrits dans le fichier de configuration : status.

- Start / stop / restart programs. -> OK

- Recharger le fichier de configuration sans arrêter le programme principal. -> OK

- Stop the main program. -> OK

- Le fichier de configuration doit permettre à l'utilisateur de spécifier ce qui suit, pour chaque programme qui doit être supervisé :

	. La commande à utiliser pour lancer le programme.
	. The number of processes to start and keep running.
	. Que ce soit pour lancer ce programme au moment du lancement ou non.
	. Que le programme devrait être redémarré toujours, jamais , ou sur des sorties inattendues seulement.
	. Which return codes represent an "expected" exit status.
	. How long the program should be running after it’s started for it to be considered
"successfully started".
	. How many times a restart should be attempted before aborting.
	. Which signal should be used to stop (i.e. exit gracefully) the program.
	. How long to wait after a graceful stop before killing the program.
	. Options to discard the program’s stdout/stderr or to redirect them to files.
	. Environment variables to set before launching the program.
	. A working directory to set before launching the program.
	. An umask to set before launching the program.