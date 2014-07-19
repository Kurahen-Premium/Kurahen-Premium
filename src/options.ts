// Konfiguracja
var customBBoardTitle = '/b/ - Random';
var enableBetterFonts = true; // Podmienia domyślne czcionki na Roboto
var deleteTextUnderPostForm = false; // Usunięcie tekstu pod elementami do postowania
var biggerOnlineCountFont = false; // Większa czcionka liczby online
var hideThreadsWithNoNewPosts = false; // Ukrywa na liście obserwowanych nitki bez nowych postów
var enableHighlightPostsButton = true; // Dodaje przycisk obok id posta który pozwala na podświetlenie wszystkich
// postów danego użytkownika
var enableJumpButtons = true; // Włącz/wyłącz przyciski przeskakujące do następnego/poprzedniego posta

// Zaawansowana konfiguracja
var unhighlightedPostOpacity = 0.3; // Przezroczystość postów niepodświetlonych przy pokazywaniu postów danego
// użytkownika; 0 - niewidoczny, 1 - nieprzezroczysty

var bbCodes = ['b', 'i', 'u', 'code', 'spoiler'];
var specialCharacters = [
	{contentToInsert: '\u2026', buttonTitle: 'Wielokropek', buttonLabel: '\u2026'},
	{contentToInsert: '\u200b', buttonTitle: 'Spacja o zerowej szerokości', buttonLabel: 'ZWSP'}
];

var wordfilters = [
	['#nowocioty', 'STAROCIOTY PAMIĘTAJĄ'],
	['#gimbo', 'xD'],
	['#penis', 'pisiorek'],
	['#wagina', 'cipuszka'],
	['#m__b', 'groźny WYKOPEK wykryty'],
	['#Lasoupeauxchoux', 'kapuśniaczek'],
	['#homoś', 'pedał'],
	['#korwinkrulempolski', 'kongres nowej prawicy'],
	['#1%', 'groźny LEWAK wykryty']
];
var boardsWithId = ['b', 'fz', 'z'];
var colors = [
	'#ff8080',
	'#ffdd80',
	'#80ffb7',
	'#80d0ff',
	'#c680ff',
	'#ffae80',
	'#d5ff80',
	'#80fffd',
	'#8097ff',
	'#ff80ca',
	'#ff7f7f',
	'#779aef',
	'#b0de6f',
	'#cc66c0',
	'#5cb9a9',
	'#f3bb79',
	'#8d71e2',
	'#6dd168',
	'#be5f7e',
	'#7bc8f6'
];

var maxPostLength = 6000;
var maxFileSize = 6000000;
var allowedFileExtensions = ['gif', 'jpeg', 'jpg', 'png', 'webm'];

/* internal configuration flags */
var roundedIdBackground = true;
var showPostCountNearHighlightPostsButton = true;
var showPostCountNearId = false;

showPostCountNearId = !enableHighlightPostsButton;
