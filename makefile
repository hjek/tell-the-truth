package: clean icons
	zip -r tell_the_truth.xpi manifest.json source/*.{js,json,html,css} icons readme.md LICENSE

clean:
	rm tell_the_truth.xpi icons/*.png||:

icons: icons/*.png

icons/*.png:
	mkdir icons||:
	inkscape -w 16 -o icons/active-16.png svg/active.svg 
	inkscape -w 32 -o icons/active-32.png svg/active.svg 
	inkscape -w 48 -o icons/active-48.png svg/active.svg 
	inkscape -w 64 -o icons/active-64.png svg/active.svg 
	inkscape -w 96 -o icons/active-96.png svg/active.svg 
	inkscape -w 128 -o icons/active-128.png svg/active.svg 
	inkscape -w 16 -o icons/inactive-16.png svg/inactive.svg 
	inkscape -w 32 -o icons/inactive-32.png svg/inactive.svg 
	inkscape -w 48 -o icons/inactive-48.png svg/inactive.svg 
	inkscape -w 64 -o icons/inactive-64.png svg/inactive.svg 
	inkscape -w 96 -o icons/inactive-96.png svg/inactive.svg 
	inkscape -w 128 -o icons/inactive-128.png svg/inactive.svg 

