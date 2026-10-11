// NAME: Like All Album Tracks In Order
// AUTHOR: andreadibartolo
// DESCRIPTION: Adds or removes all tracks of an album from Favorites while preserving the original order, with a dedicated section in Spotify Settings.

(function likeAlbumInOrder() {
    if (
        !Spicetify.Platform ||
        !Spicetify.GraphQL ||
        !Spicetify.ContextMenu ||
        !Spicetify.URI ||
        !Spicetify.LocalStorage ||
        !Spicetify.showNotification
    ) {
        setTimeout(likeAlbumInOrder, 300);
        return;
    }

    const translations = {
        en: {
            likeInOrder: "Like in order",
            removeLikes: "Remove Likes",
            addFinished: "Adding completed!",
            removeFinished: "Tracks removed from Liked Songs!",
            adding: "Adding to Liked Songs...",
            removing: "Removing from Liked Songs...",
            graphQlDefinitionMissing: "GraphQL album definition not found.",
            graphQlTracksUnavailable: "Unable to read the track list from the GraphQL response.",
            operationInProgress: "An operation is already in progress. Please wait!",
            noTracksFound: "No tracks found in this album.",
            error: "Error",
            unableToFetchTracks: "Unable to retrieve tracks",
            unableToRemoveTracks: "Unable to remove tracks",
            addAlbumTitle: "Add album tracks to Liked Songs?",
            addAlbumDescription:
                "You saved the album to your library. Would you also like to add all its tracks to <b>Liked Songs</b> in album order (last track to first)?",
            noJustAlbum: "No, just the album",
            yesAddTracks: "Yes, add tracks",
            removeAlbumTitle: "Remove album tracks from Liked Songs?",
            removeAlbumDescription: "Do you want to remove all tracks from this album from your <b>Liked Songs</b>?",
            cancel: "Cancel",
            yesRemoveAll: "Yes, remove all",
            menuAdd: "Add album tracks to Liked Songs (in order)",
            menuRemove: "Remove all album tracks from Liked Songs",
            likeButtonTitle: "Add all tracks to Liked Songs in order (last track to first)",
            unlikeButtonTitle: "Remove all tracks from this album from Liked Songs",
            settingsTitle: "Like Album In Order (Extension)",
            delayLabel: "Delay between saving tracks (ms)",
            delayDescription:
                "Pause in milliseconds between tracks to ensure Spotify keeps them in order (recommended: 2000 ms).",
            askSaveLabel: 'Ask to add tracks when saving an album with "+"',
            askSaveDescription: 'Show a confirmation when you click "+" to save an album to your library.',
            confirmRemoveLabel: "Ask for confirmation before removing tracks from Liked Songs",
            confirmRemoveDescription: 'Prevent accidental removals when clicking the "Remove Likes" button.',
            delaySaved: "Delay set to {delay} ms",
        },
        it: {
            likeInOrder: "Like in ordine",
            removeLikes: "Rimuovi Like",
            addFinished: "Aggiunta completata!",
            removeFinished: "Brani rimossi dai Preferiti!",
            adding: "Aggiunta ai Preferiti in corso...",
            removing: "Rimozione dai Preferiti...",
            graphQlDefinitionMissing: "Definizione GraphQL per gli album non trovata.",
            graphQlTracksUnavailable: "Impossibile leggere la lista dei brani dalla risposta GraphQL.",
            operationInProgress: "Operazione già in corso, attendi il completamento!",
            noTracksFound: "Nessun brano trovato in questo album.",
            error: "Errore",
            unableToFetchTracks: "Impossibile recuperare i brani",
            unableToRemoveTracks: "Impossibile rimuovere i brani",
            addAlbumTitle: "Aggiungere i brani ai Preferiti?",
            addAlbumDescription:
                "Hai salvato l'album nella libreria. Vuoi aggiungere anche tutti i singoli brani ai <b>Brani che ti piacciono</b> mantenendo l'ordine dell'album (dall'ultimo al primo)?",
            noJustAlbum: "No, solo l'album",
            yesAddTracks: "Sì, aggiungi i brani",
            removeAlbumTitle: "Rimuovere i brani dai Preferiti?",
            removeAlbumDescription:
                "Vuoi rimuovere tutti i brani di questo album dalla tua lista <b>Brani che ti piacciono</b>?",
            cancel: "Annulla",
            yesRemoveAll: "Sì, rimuovi tutti",
            menuAdd: "Aggiungi brani ai Preferiti (in ordine)",
            menuRemove: "Rimuovi tutti i brani dai Preferiti",
            likeButtonTitle: "Aggiungi tutti i brani ai Preferiti in ordine (dall'ultimo al primo)",
            unlikeButtonTitle: "Rimuovi tutti i brani di questo album dai Preferiti",
            settingsTitle: "Like Album In Order (Estensione)",
            delayLabel: "Ritardo tra il salvataggio dei brani (ms)",
            delayDescription:
                "Pausa in millisecondi tra un brano e l'altro per garantire che Spotify mantenga l'ordine (consigliato: 2000 ms).",
            askSaveLabel: 'Chiedi di aggiungere i brani quando salvi un album con il "+"',
            askSaveDescription:
                'Mostra una finestra di conferma quando clicchi sul pulsante "+" per salvare un album nella libreria.',
            confirmRemoveLabel: "Chiedi conferma prima di rimuovere i brani dai Preferiti",
            confirmRemoveDescription: 'Evita rimozioni accidentali quando premi il pulsante "Rimuovi Like".',
            delaySaved: "Ritardo impostato a {delay} ms",
        },
        zh: {
            likeInOrder: "按顺序收藏",
            removeLikes: "取消喜欢",
            addFinished: "添加完成！",
            removeFinished: "已从喜欢的歌曲中移除！",
            adding: "正在添加到喜欢的歌曲…",
            removing: "正在从喜欢的歌曲中移除…",
            graphQlDefinitionMissing: "未找到专辑的 GraphQL 定义。",
            graphQlTracksUnavailable: "无法读取 GraphQL 响应中的曲目列表。",
            operationInProgress: "操作正在进行中，请稍候！",
            noTracksFound: "此专辑中没有找到曲目。",
            error: "错误",
            unableToFetchTracks: "无法获取曲目",
            unableToRemoveTracks: "无法移除曲目",
            addAlbumTitle: "将专辑曲目添加到喜欢的歌曲？",
            addAlbumDescription:
                "已将专辑保存到曲库。是否也要按专辑顺序（从最后一首到第一首）将所有曲目添加到<b>喜欢的歌曲</b>？",
            noJustAlbum: "不，只保存专辑",
            yesAddTracks: "是，添加曲目",
            removeAlbumTitle: "从喜欢的歌曲中移除专辑曲目？",
            removeAlbumDescription: "要从<b>喜欢的歌曲</b>中移除此专辑的所有曲目吗？",
            cancel: "取消",
            yesRemoveAll: "是，全部移除",
            menuAdd: "按顺序添加专辑曲目到喜欢的歌曲",
            menuRemove: "从喜欢的歌曲中移除所有专辑曲目",
            likeButtonTitle: "按顺序将所有曲目添加到喜欢的歌曲（从最后一首到第一首）",
            unlikeButtonTitle: "从喜欢的歌曲中移除此专辑的所有曲目",
            settingsTitle: "按顺序收藏专辑（扩展）",
            delayLabel: "保存曲目之间的间隔（毫秒）",
            delayDescription: "曲目之间的暂停时间，以确保 Spotify 保持曲目顺序（建议：2000 毫秒）。",
            askSaveLabel: "使用“+”保存专辑时询问是否添加曲目",
            askSaveDescription: "点击“+”将专辑保存到曲库时显示确认窗口。",
            confirmRemoveLabel: "从喜欢的歌曲中移除曲目前询问确认",
            confirmRemoveDescription: "点击“取消喜欢”按钮时避免意外移除。",
            delaySaved: "间隔已设为 {delay} 毫秒",
        },
        hi: {
            likeInOrder: "क्रम में पसंद करें",
            removeLikes: "पसंद हटाएँ",
            addFinished: "जोड़ना पूरा हुआ!",
            removeFinished: "पसंद किए गए गानों से ट्रैक हटा दिए गए!",
            adding: "पसंद किए गए गानों में जोड़ा जा रहा है...",
            removing: "पसंद किए गए गानों से हटाया जा रहा है...",
            graphQlDefinitionMissing: "एल्बम की GraphQL परिभाषा नहीं मिली।",
            graphQlTracksUnavailable: "GraphQL जवाब से ट्रैक सूची पढ़ी नहीं जा सकी।",
            operationInProgress: "एक कार्रवाई पहले से जारी है, कृपया प्रतीक्षा करें!",
            noTracksFound: "इस एल्बम में कोई ट्रैक नहीं मिला।",
            error: "त्रुटि",
            unableToFetchTracks: "ट्रैक प्राप्त नहीं किए जा सके",
            unableToRemoveTracks: "ट्रैक हटाए नहीं जा सके",
            addAlbumTitle: "एल्बम के ट्रैक पसंद किए गए गानों में जोड़ें?",
            addAlbumDescription:
                "एल्बम आपकी लाइब्रेरी में सेव हो गया है। क्या आप एल्बम के क्रम में (आखिरी से पहले तक) सभी ट्रैक <b>पसंद किए गए गानों</b> में भी जोड़ना चाहते हैं?",
            noJustAlbum: "नहीं, सिर्फ़ एल्बम",
            yesAddTracks: "हाँ, ट्रैक जोड़ें",
            removeAlbumTitle: "एल्बम के ट्रैक पसंद किए गए गानों से हटाएँ?",
            removeAlbumDescription: "क्या आप इस एल्बम के सभी ट्रैक <b>पसंद किए गए गानों</b> से हटाना चाहते हैं?",
            cancel: "रद्द करें",
            yesRemoveAll: "हाँ, सभी हटाएँ",
            menuAdd: "एल्बम के ट्रैक क्रम में पसंद किए गए गानों में जोड़ें",
            menuRemove: "एल्बम के सभी ट्रैक पसंद किए गए गानों से हटाएँ",
            likeButtonTitle: "सभी ट्रैक क्रम में पसंद किए गए गानों में जोड़ें (आखिरी से पहले तक)",
            unlikeButtonTitle: "इस एल्बम के सभी ट्रैक पसंद किए गए गानों से हटाएँ",
            settingsTitle: "एल्बम क्रम में पसंद करें (एक्सटेंशन)",
            delayLabel: "ट्रैक सेव करने के बीच का अंतराल (मिलीसेकंड)",
            delayDescription: "Spotify में क्रम बनाए रखने के लिए ट्रैक के बीच विराम (सुझाया गया: 2000 मिलीसेकंड)।",
            askSaveLabel: "“+” से एल्बम सेव करते समय ट्रैक जोड़ने के लिए पूछें",
            askSaveDescription: "लाइब्रेरी में एल्बम सेव करने के लिए “+” क्लिक करने पर पुष्टि दिखाएँ।",
            confirmRemoveLabel: "पसंद किए गए गानों से ट्रैक हटाने से पहले पुष्टि पूछें",
            confirmRemoveDescription: "“पसंद हटाएँ” बटन दबाने पर गलती से ट्रैक हटने से बचाएँ।",
            delaySaved: "अंतराल {delay} मिलीसेकंड पर सेट किया गया",
        },
        es: {
            likeInOrder: "Añadir Me gusta en orden",
            removeLikes: "Quitar Me gusta",
            addFinished: "¡Añadido!",
            removeFinished: "¡Se quitaron las canciones de Me gusta!",
            adding: "Añadiendo a Canciones que te gustan...",
            removing: "Quitando de Canciones que te gustan...",
            graphQlDefinitionMissing: "No se encontró la definición GraphQL del álbum.",
            graphQlTracksUnavailable: "No se pudo leer la lista de canciones de la respuesta GraphQL.",
            operationInProgress: "Ya hay una operación en curso. ¡Espera a que termine!",
            noTracksFound: "No se encontraron canciones en este álbum.",
            error: "Error",
            unableToFetchTracks: "No se pudieron obtener las canciones",
            unableToRemoveTracks: "No se pudieron quitar las canciones",
            addAlbumTitle: "¿Añadir las canciones del álbum a Canciones que te gustan?",
            addAlbumDescription:
                "Has guardado el álbum en tu biblioteca. ¿Quieres añadir también todas sus canciones a <b>Canciones que te gustan</b> en el orden del álbum (de la última a la primera)?",
            noJustAlbum: "No, solo el álbum",
            yesAddTracks: "Sí, añadir canciones",
            removeAlbumTitle: "¿Quitar las canciones del álbum de Canciones que te gustan?",
            removeAlbumDescription:
                "¿Quieres quitar todas las canciones de este álbum de <b>Canciones que te gustan</b>?",
            cancel: "Cancelar",
            yesRemoveAll: "Sí, quitar todas",
            menuAdd: "Añadir canciones del álbum a Canciones que te gustan (en orden)",
            menuRemove: "Quitar todas las canciones del álbum de Canciones que te gustan",
            likeButtonTitle: "Añadir todas las canciones a Canciones que te gustan en orden (de la última a la primera)",
            unlikeButtonTitle: "Quitar todas las canciones de este álbum de Canciones que te gustan",
            settingsTitle: "Like Album In Order (Extensión)",
            delayLabel: "Pausa entre canciones al guardarlas (ms)",
            delayDescription:
                "Pausa en milisegundos entre canciones para que Spotify mantenga el orden (recomendado: 2000 ms).",
            askSaveLabel: 'Preguntar si quieres añadir canciones al guardar un álbum con «+»',
            askSaveDescription: "Mostrar una confirmación al hacer clic en «+» para guardar un álbum en la biblioteca.",
            confirmRemoveLabel: "Pedir confirmación antes de quitar canciones de Me gusta",
            confirmRemoveDescription: 'Evitar eliminaciones accidentales al pulsar «Quitar Me gusta».',
            delaySaved: "Pausa establecida en {delay} ms",
        },
        fr: {
            likeInOrder: "Ajouter aux titres likés dans l’ordre",
            removeLikes: "Retirer des titres likés",
            addFinished: "Ajout terminé !",
            removeFinished: "Titres retirés des titres likés !",
            adding: "Ajout aux titres likés en cours...",
            removing: "Retrait des titres likés en cours...",
            graphQlDefinitionMissing: "Définition GraphQL de l’album introuvable.",
            graphQlTracksUnavailable: "Impossible de lire la liste des titres depuis la réponse GraphQL.",
            operationInProgress: "Une opération est déjà en cours. Veuillez patienter !",
            noTracksFound: "Aucun titre trouvé dans cet album.",
            error: "Erreur",
            unableToFetchTracks: "Impossible de récupérer les titres",
            unableToRemoveTracks: "Impossible de retirer les titres",
            addAlbumTitle: "Ajouter les titres de l’album aux titres likés ?",
            addAlbumDescription:
                "L’album a été enregistré dans votre bibliothèque. Voulez-vous également ajouter tous ses titres aux <b>titres likés</b> dans l’ordre de l’album (du dernier au premier) ?",
            noJustAlbum: "Non, l’album seulement",
            yesAddTracks: "Oui, ajouter les titres",
            removeAlbumTitle: "Retirer les titres de l’album des titres likés ?",
            removeAlbumDescription: "Voulez-vous retirer tous les titres de cet album de vos <b>titres likés</b> ?",
            cancel: "Annuler",
            yesRemoveAll: "Oui, tout retirer",
            menuAdd: "Ajouter les titres de l’album aux titres likés (dans l’ordre)",
            menuRemove: "Retirer tous les titres de l’album des titres likés",
            likeButtonTitle: "Ajouter tous les titres aux titres likés dans l’ordre (du dernier au premier)",
            unlikeButtonTitle: "Retirer tous les titres de cet album des titres likés",
            settingsTitle: "Like Album In Order (Extension)",
            delayLabel: "Délai entre l’enregistrement des titres (ms)",
            delayDescription:
                "Pause en millisecondes entre les titres pour que Spotify conserve leur ordre (recommandé : 2000 ms).",
            askSaveLabel: "Proposer d’ajouter les titres lors de l’enregistrement d’un album avec « + »",
            askSaveDescription: "Afficher une confirmation lorsque vous cliquez sur « + » pour enregistrer un album.",
            confirmRemoveLabel: "Demander confirmation avant de retirer des titres likés",
            confirmRemoveDescription: "Éviter les retraits accidentels en cliquant sur « Retirer des titres likés ».",
            delaySaved: "Délai défini sur {delay} ms",
        },
        ar: {
            likeInOrder: "إضافة الإعجابات بالترتيب",
            removeLikes: "إزالة الإعجابات",
            addFinished: "اكتملت الإضافة!",
            removeFinished: "تمت إزالة المقاطع من الأغاني المفضلة!",
            adding: "جارٍ الإضافة إلى الأغاني المفضلة...",
            removing: "جارٍ الإزالة من الأغاني المفضلة...",
            graphQlDefinitionMissing: "تعذر العثور على تعريف GraphQL للألبوم.",
            graphQlTracksUnavailable: "تعذرت قراءة قائمة المقاطع من استجابة GraphQL.",
            operationInProgress: "هناك عملية قيد التنفيذ بالفعل، يُرجى الانتظار!",
            noTracksFound: "لم يتم العثور على مقاطع في هذا الألبوم.",
            error: "خطأ",
            unableToFetchTracks: "تعذر جلب المقاطع",
            unableToRemoveTracks: "تعذرت إزالة المقاطع",
            addAlbumTitle: "إضافة مقاطع الألبوم إلى الأغاني المفضلة؟",
            addAlbumDescription:
                "تم حفظ الألبوم في مكتبتك. هل تريد أيضًا إضافة جميع مقاطعه إلى <b>الأغاني المفضلة</b> بترتيب الألبوم (من الأخير إلى الأول)؟",
            noJustAlbum: "لا، الألبوم فقط",
            yesAddTracks: "نعم، أضف المقاطع",
            removeAlbumTitle: "إزالة مقاطع الألبوم من الأغاني المفضلة؟",
            removeAlbumDescription: "هل تريد إزالة جميع مقاطع هذا الألبوم من <b>الأغاني المفضلة</b>؟",
            cancel: "إلغاء",
            yesRemoveAll: "نعم، أزل الكل",
            menuAdd: "إضافة مقاطع الألبوم إلى الأغاني المفضلة (بالترتيب)",
            menuRemove: "إزالة جميع مقاطع الألبوم من الأغاني المفضلة",
            likeButtonTitle: "إضافة جميع المقاطع إلى الأغاني المفضلة بالترتيب (من الأخير إلى الأول)",
            unlikeButtonTitle: "إزالة جميع مقاطع هذا الألبوم من الأغاني المفضلة",
            settingsTitle: "Like Album In Order (إضافة)",
            delayLabel: "الفاصل بين حفظ المقاطع (مللي ثانية)",
            delayDescription: "مهلة بين المقاطع لضمان احتفاظ Spotify بالترتيب (الموصى به: 2000 مللي ثانية).",
            askSaveLabel: "السؤال عن إضافة المقاطع عند حفظ ألبوم باستخدام «+»",
            askSaveDescription: "إظهار رسالة تأكيد عند النقر على «+» لحفظ ألبوم في مكتبتك.",
            confirmRemoveLabel: "طلب التأكيد قبل إزالة المقاطع من الأغاني المفضلة",
            confirmRemoveDescription: "تجنب الإزالة غير المقصودة عند النقر على زر «إزالة الإعجابات».",
            delaySaved: "تم ضبط الفاصل على {delay} مللي ثانية",
        },
        bn: {
            likeInOrder: "ক্রম অনুযায়ী পছন্দ করুন",
            removeLikes: "পছন্দ সরান",
            addFinished: "যোগ করা সম্পন্ন হয়েছে!",
            removeFinished: "পছন্দের গান থেকে ট্র্যাক সরানো হয়েছে!",
            adding: "পছন্দের গানে যোগ করা হচ্ছে...",
            removing: "পছন্দের গান থেকে সরানো হচ্ছে...",
            graphQlDefinitionMissing: "অ্যালবামের GraphQL সংজ্ঞা পাওয়া যায়নি।",
            graphQlTracksUnavailable: "GraphQL প্রতিক্রিয়া থেকে ট্র্যাকের তালিকা পড়া যায়নি।",
            operationInProgress: "একটি কাজ ইতিমধ্যে চলছে, অনুগ্রহ করে অপেক্ষা করুন!",
            noTracksFound: "এই অ্যালবামে কোনো ট্র্যাক পাওয়া যায়নি।",
            error: "ত্রুটি",
            unableToFetchTracks: "ট্র্যাক আনা যায়নি",
            unableToRemoveTracks: "ট্র্যাক সরানো যায়নি",
            addAlbumTitle: "অ্যালবামের ট্র্যাক পছন্দের গানে যোগ করবেন?",
            addAlbumDescription:
                "অ্যালবামটি আপনার লাইব্রেরিতে সংরক্ষিত হয়েছে। অ্যালবামের ক্রমে (শেষ ট্র্যাক থেকে প্রথমে) সব ট্র্যাক <b>পছন্দের গানে</b> যোগ করতে চান?",
            noJustAlbum: "না, শুধু অ্যালবাম",
            yesAddTracks: "হ্যাঁ, ট্র্যাক যোগ করুন",
            removeAlbumTitle: "পছন্দের গান থেকে অ্যালবামের ট্র্যাক সরাবেন?",
            removeAlbumDescription: "এই অ্যালবামের সব ট্র্যাক <b>পছন্দের গান</b> থেকে সরাতে চান?",
            cancel: "বাতিল",
            yesRemoveAll: "হ্যাঁ, সব সরান",
            menuAdd: "অ্যালবামের ট্র্যাক ক্রম অনুযায়ী পছন্দের গানে যোগ করুন",
            menuRemove: "পছন্দের গান থেকে অ্যালবামের সব ট্র্যাক সরান",
            likeButtonTitle: "সব ট্র্যাক ক্রম অনুযায়ী পছন্দের গানে যোগ করুন (শেষ থেকে প্রথমে)",
            unlikeButtonTitle: "পছন্দের গান থেকে এই অ্যালবামের সব ট্র্যাক সরান",
            settingsTitle: "ক্রম অনুযায়ী অ্যালবাম পছন্দ (এক্সটেনশন)",
            delayLabel: "ট্র্যাক সংরক্ষণের মধ্যবর্তী বিরতি (মিলিসেকেন্ড)",
            delayDescription: "Spotify-তে ক্রম ঠিক রাখতে ট্র্যাকের মাঝে বিরতি (প্রস্তাবিত: ২০০০ মিলিসেকেন্ড)।",
            askSaveLabel: "“+” দিয়ে অ্যালবাম সংরক্ষণ করলে ট্র্যাক যোগ করার বিষয়ে জিজ্ঞাসা করুন",
            askSaveDescription: "লাইব্রেরিতে অ্যালবাম সংরক্ষণ করতে “+” চাপলে নিশ্চিতকরণ দেখান।",
            confirmRemoveLabel: "পছন্দের গান থেকে ট্র্যাক সরানোর আগে নিশ্চিতকরণ চান",
            confirmRemoveDescription: "“পছন্দ সরান” বোতামে চাপলে ভুল করে সরানো ঠেকান।",
            delaySaved: "বিরতি {delay} মিলিসেকেন্ড নির্ধারণ করা হয়েছে",
        },
        pt: {
            likeInOrder: "Gostar em ordem",
            removeLikes: "Remover curtidas",
            addFinished: "Adição concluída!",
            removeFinished: "Faixas removidas das músicas curtidas!",
            adding: "Adicionando às músicas curtidas...",
            removing: "Removendo das músicas curtidas...",
            graphQlDefinitionMissing: "Definição GraphQL do álbum não encontrada.",
            graphQlTracksUnavailable: "Não foi possível ler a lista de faixas da resposta GraphQL.",
            operationInProgress: "Já existe uma operação em andamento. Aguarde!",
            noTracksFound: "Nenhuma faixa encontrada neste álbum.",
            error: "Erro",
            unableToFetchTracks: "Não foi possível buscar as faixas",
            unableToRemoveTracks: "Não foi possível remover as faixas",
            addAlbumTitle: "Adicionar faixas do álbum às músicas curtidas?",
            addAlbumDescription:
                "Você salvou o álbum na sua biblioteca. Quer também adicionar todas as faixas às <b>músicas curtidas</b> na ordem do álbum (da última para a primeira)?",
            noJustAlbum: "Não, apenas o álbum",
            yesAddTracks: "Sim, adicionar faixas",
            removeAlbumTitle: "Remover faixas do álbum das músicas curtidas?",
            removeAlbumDescription: "Quer remover todas as faixas deste álbum das suas <b>músicas curtidas</b>?",
            cancel: "Cancelar",
            yesRemoveAll: "Sim, remover todas",
            menuAdd: "Adicionar faixas do álbum às músicas curtidas (em ordem)",
            menuRemove: "Remover todas as faixas do álbum das músicas curtidas",
            likeButtonTitle: "Adicionar todas as faixas às músicas curtidas em ordem (da última para a primeira)",
            unlikeButtonTitle: "Remover todas as faixas deste álbum das músicas curtidas",
            settingsTitle: "Like Album In Order (Extensão)",
            delayLabel: "Intervalo entre salvar as faixas (ms)",
            delayDescription:
                "Pausa em milissegundos entre as faixas para o Spotify manter a ordem (recomendado: 2000 ms).",
            askSaveLabel: 'Perguntar se deseja adicionar faixas ao salvar um álbum com "+"',
            askSaveDescription: 'Mostrar uma confirmação ao clicar em "+" para salvar um álbum na biblioteca.',
            confirmRemoveLabel: "Pedir confirmação antes de remover faixas das músicas curtidas",
            confirmRemoveDescription: 'Evitar remoções acidentais ao clicar em "Remover curtidas".',
            delaySaved: "Intervalo definido para {delay} ms",
        },
        ru: {
            likeInOrder: "Добавить в избранное по порядку",
            removeLikes: "Убрать из избранного",
            addFinished: "Добавление завершено!",
            removeFinished: "Треки удалены из любимых!",
            adding: "Добавление в любимые треки...",
            removing: "Удаление из любимых треков...",
            graphQlDefinitionMissing: "Не найдено описание альбома GraphQL.",
            graphQlTracksUnavailable: "Не удалось прочитать список треков из ответа GraphQL.",
            operationInProgress: "Операция уже выполняется. Подождите!",
            noTracksFound: "В этом альбоме не найдены треки.",
            error: "Ошибка",
            unableToFetchTracks: "Не удалось получить треки",
            unableToRemoveTracks: "Не удалось удалить треки",
            addAlbumTitle: "Добавить треки альбома в любимые?",
            addAlbumDescription:
                "Альбом сохранён в вашей медиатеке. Добавить все его треки в <b>любимые</b> в порядке альбома (от последнего к первому)?",
            noJustAlbum: "Нет, только альбом",
            yesAddTracks: "Да, добавить треки",
            removeAlbumTitle: "Удалить треки альбома из любимых?",
            removeAlbumDescription: "Удалить все треки этого альбома из списка <b>любимых</b>?",
            cancel: "Отмена",
            yesRemoveAll: "Да, удалить все",
            menuAdd: "Добавить треки альбома в любимые (по порядку)",
            menuRemove: "Удалить все треки альбома из любимых",
            likeButtonTitle: "Добавить все треки в любимые по порядку (от последнего к первому)",
            unlikeButtonTitle: "Удалить все треки этого альбома из любимых",
            settingsTitle: "Like Album In Order (расширение)",
            delayLabel: "Задержка между сохранением треков (мс)",
            delayDescription: "Пауза между треками, чтобы Spotify сохранил их порядок (рекомендуется: 2000 мс).",
            askSaveLabel: "Спрашивать о добавлении треков при сохранении альбома через «+»",
            askSaveDescription: "Показывать подтверждение при нажатии «+» для сохранения альбома в медиатеке.",
            confirmRemoveLabel: "Запрашивать подтверждение перед удалением треков из любимых",
            confirmRemoveDescription: "Предотвращает случайное удаление при нажатии «Убрать из избранного».",
            delaySaved: "Задержка установлена: {delay} мс",
        },
        ur: {
            likeInOrder: "ترتیب سے پسند کریں",
            removeLikes: "پسندیدگیاں ہٹائیں",
            addFinished: "شامل کرنا مکمل ہو گیا!",
            removeFinished: "پسندیدہ گانوں سے ٹریک ہٹا دیے گئے!",
            adding: "پسندیدہ گانوں میں شامل کیا جا رہا ہے...",
            removing: "پسندیدہ گانوں سے ہٹایا جا رہا ہے...",
            graphQlDefinitionMissing: "البم کی GraphQL تعریف نہیں ملی۔",
            graphQlTracksUnavailable: "GraphQL جواب سے ٹریک کی فہرست نہیں پڑھی جا سکی۔",
            operationInProgress: "ایک کارروائی پہلے سے جاری ہے، براہِ کرم انتظار کریں!",
            noTracksFound: "اس البم میں کوئی ٹریک نہیں ملا۔",
            error: "خرابی",
            unableToFetchTracks: "ٹریک حاصل نہیں کیے جا سکے",
            unableToRemoveTracks: "ٹریک نہیں ہٹائے جا سکے",
            addAlbumTitle: "البم کے ٹریک پسندیدہ گانوں میں شامل کریں؟",
            addAlbumDescription:
                "آپ نے البم اپنی لائبریری میں محفوظ کر لیا ہے۔ کیا اس کے تمام ٹریک البم کی ترتیب میں (آخری سے پہلے تک) <b>پسندیدہ گانوں</b> میں بھی شامل کرنا چاہتے ہیں؟",
            noJustAlbum: "نہیں، صرف البم",
            yesAddTracks: "ہاں، ٹریک شامل کریں",
            removeAlbumTitle: "البم کے ٹریک پسندیدہ گانوں سے ہٹائیں؟",
            removeAlbumDescription: "کیا آپ اس البم کے تمام ٹریک <b>پسندیدہ گانوں</b> سے ہٹانا چاہتے ہیں؟",
            cancel: "منسوخ کریں",
            yesRemoveAll: "ہاں، سب ہٹائیں",
            menuAdd: "البم کے ٹریک ترتیب سے پسندیدہ گانوں میں شامل کریں",
            menuRemove: "البم کے تمام ٹریک پسندیدہ گانوں سے ہٹائیں",
            likeButtonTitle: "تمام ٹریک ترتیب سے پسندیدہ گانوں میں شامل کریں (آخری سے پہلے تک)",
            unlikeButtonTitle: "اس البم کے تمام ٹریک پسندیدہ گانوں سے ہٹائیں",
            settingsTitle: "ترتیب سے البم پسند کریں (ایکسٹینشن)",
            delayLabel: "ٹریک محفوظ کرنے کے درمیان وقفہ (ملی سیکنڈ)",
            delayDescription: "Spotify میں ترتیب برقرار رکھنے کے لیے ٹریکس کے درمیان وقفہ (تجویز کردہ: 2000 ملی سیکنڈ)۔",
            askSaveLabel: "«+» سے البم محفوظ کرتے وقت ٹریک شامل کرنے کے بارے میں پوچھیں",
            askSaveDescription: "لائبریری میں البم محفوظ کرنے کے لیے «+» پر کلک کرنے پر تصدیق دکھائیں۔",
            confirmRemoveLabel: "پسندیدہ گانوں سے ٹریک ہٹانے سے پہلے تصدیق پوچھیں",
            confirmRemoveDescription: "«پسندیدگیاں ہٹائیں» بٹن پر کلک کرنے سے غلطی سے ٹریک ہٹنے سے بچائیں۔",
            delaySaved: "وقفہ {delay} ملی سیکنڈ مقرر کر دیا گیا",
        },
    };

    const isRightToLeft = new Set(["ar", "ur"]);

    function getLanguage() {
        const candidates = [
            Spicetify.Locale,
            document.documentElement.lang,
            navigator.language,
        ];

        for (const candidate of candidates) {
            if (typeof candidate !== "string") continue;
            const language = candidate.trim().replace(/_/g, "-").split("-")[0].toLowerCase();
            if (Object.prototype.hasOwnProperty.call(translations, language)) return language;
        }

        return "en";
    }

    const language = getLanguage();
    const t = (key, values = {}) =>
        (translations[language][key] || translations.en[key]).replace(
            /\{(\w+)\}/g,
            (match, name) => (values[name] === undefined ? match : values[name])
        );

    console.log("[LikeAlbumInOrder] Estensione caricata correttamente (v4).");

    // --- GESTIONE IMPOSTAZIONI (LocalStorage) ---
    const STORAGE_KEYS = {
        DELAY_MS: "likeAlbumInOrder:delayMs",
        ASK_ON_SAVE: "likeAlbumInOrder:askOnSave",
        CONFIRM_REMOVE: "likeAlbumInOrder:confirmRemove",
    };

    const DEFAULT_SETTINGS = {
        delayMs: 2000,
        askOnSave: true,
        confirmRemove: true,
    };

    function getDelayMs() {
        const raw = Spicetify.LocalStorage.get(STORAGE_KEYS.DELAY_MS);
        const parsed = parseInt(raw, 10);
        return !isNaN(parsed) && parsed >= 50 ? parsed : DEFAULT_SETTINGS.delayMs;
    }

    function setDelayMs(val) {
        const parsed = parseInt(val, 10);
        const safeVal = !isNaN(parsed) && parsed >= 50 ? parsed : DEFAULT_SETTINGS.delayMs;
        Spicetify.LocalStorage.set(STORAGE_KEYS.DELAY_MS, String(safeVal));
        return safeVal;
    }

    function getBoolSetting(key, defaultVal) {
        const raw = Spicetify.LocalStorage.get(key);
        if (raw === null || raw === undefined) return defaultVal;
        return raw === "true";
    }

    function setBoolSetting(key, val) {
        Spicetify.LocalStorage.set(key, val ? "true" : "false");
    }

    // --- STATO GLOBALE E ID ELEMENTI DOM ---
    let isProcessing = false;
    let currentProgressText = null;
    let lastModalTriggerTime = 0;

    const LIKE_BUTTON_ID = "spicetify-reverse-like-btn";
    const UNLIKE_BUTTON_ID = "spicetify-reverse-unlike-btn";
    const MODAL_ID = "spicetify-reverse-like-modal";
    const HUD_ID = "spicetify-reverse-like-hud";
    const SETTINGS_SECTION_ID = "spicetify-reverse-like-settings";
    const REMOVE_STEP_DELAY_MS = 100;

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const getLikeButtonHtml = () => `
        <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1.69 2A4.582 4.582 0 0 1 8 2.023 4.583 4.583 0 0 1 11.88.817h.002a4.618 4.618 0 0 1 3.782 3.65v.003a4.543 4.543 0 0 1-1.011 3.84L9.35 14.629a1.765 1.765 0 0 1-2.093.464 1.762 1.762 0 0 1-.605-.463L1.348 8.309A4.582 4.582 0 0 1 1.689 2zm3.158.252A3.082 3.082 0 0 0 2.49 7.337l.005.005L7.8 13.664a.264.264 0 0 0 .311.069.262.262 0 0 0 .09-.069l5.312-6.33a3.043 3.043 0 0 0 .68-2.573 3.118 3.118 0 0 0-2.551-2.463 3.079 3.079 0 0 0-2.612.816l-.007.007a1.501 1.501 0 0 1-2.045 0l-.009-.008a3.082 3.082 0 0 0-2.121-.861z"></path>
        </svg>
        <span>${t("likeInOrder")}</span>
    `;

    const getUnlikeButtonHtml = () => `
        <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"></path>
            <path d="M4 7.25h8v1.5H4v-1.5z"></path>
        </svg>
        <span>${t("removeLikes")}</span>
    `;

    /**
     * Aggiorna il pannello flottante (HUD) e i pulsanti nella barra azioni
     */
    function updateProgressUI(current, total, finished = false, mode = "add") {
        const accentColor = mode === "remove" ? "#f15e6c" : "#1ed760";
        const likeBtn = document.getElementById(LIKE_BUTTON_ID);
        const unlikeBtn = document.getElementById(UNLIKE_BUTTON_ID);

        if (likeBtn) {
            if (isProcessing && mode === "add" && currentProgressText) {
                likeBtn.innerHTML = `<span style="font-size: 13px; font-weight: 700; color: ${accentColor};">${currentProgressText}</span>`;
                likeBtn.style.borderColor = accentColor;
            } else {
                likeBtn.innerHTML = getLikeButtonHtml();
                likeBtn.style.borderColor = "var(--essential-subdued, rgba(255, 255, 255, 0.3))";
            }
        }

        if (unlikeBtn) {
            if (isProcessing && mode === "remove" && currentProgressText) {
                unlikeBtn.innerHTML = `<span style="font-size: 13px; font-weight: 700; color: ${accentColor};">${currentProgressText}</span>`;
                unlikeBtn.style.borderColor = accentColor;
            } else {
                unlikeBtn.innerHTML = getUnlikeButtonHtml();
                unlikeBtn.style.borderColor = "var(--essential-subdued, rgba(255, 255, 255, 0.3))";
            }
        }

        let hud = document.getElementById(HUD_ID);

        if (!isProcessing && !finished) {
            if (hud) hud.remove();
            return;
        }

        if (!hud) {
            hud = document.createElement("div");
            hud.id = HUD_ID;
            hud.style.cssText = `
                position: fixed;
                bottom: 105px;
                right: 24px;
                z-index: 999999;
                background: var(--spice-card, #181818);
                color: var(--spice-text, #ffffff);
                border: 1px solid ${accentColor};
                border-radius: 10px;
                padding: 14px 18px;
                min-width: 260px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
                font-family: inherit;
                transition: opacity 0.25s ease;
            `;
            hud.dir = "auto";
            document.body.appendChild(hud);
        } else {
            hud.style.borderColor = accentColor;
        }

        const percent = total > 0 ? Math.round((current / total) * 100) : 0;
        const statusTitle = finished
            ? mode === "remove"
                ? t("removeFinished")
                : t("addFinished")
            : mode === "remove"
            ? t("removing")
            : t("adding");

        const symbol = mode === "remove" ? "✕" : "♥";

        hud.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 13px; font-weight: 600; color: var(--spice-text, #ffffff);">
                    ${statusTitle}
                </span>
                <span style="font-size: 14px; font-weight: 800; color: ${accentColor}; white-space: nowrap;">
                    ${symbol} ${current} / ${total}
                </span>
            </div>
            <div style="width: 100%; height: 6px; background: rgba(255, 255, 255, 0.15); border-radius: 999px; overflow: hidden;">
                <div style="width: ${percent}%; height: 100%; background: ${accentColor}; transition: width 0.2s ease;"></div>
            </div>
        `;

        if (finished) {
            setTimeout(() => {
                const el = document.getElementById(HUD_ID);
                if (el) el.remove();
            }, 2200);
        }
    }

    /**
     * Recupera tutti gli URI dei brani tramite le API GraphQL interne di Spotify
     */
    async function fetchAlbumTrackUris(albumUri) {
        const { Definitions, Request } = Spicetify.GraphQL;
        const queryDef = Definitions.getAlbum || Definitions.queryAlbumTracks;

        if (!queryDef) {
            throw new Error(t("graphQlDefinitionMissing"));
        }

        let trackUris = [];
        let offset = 0;
        const limit = 300;
        let totalCount = Infinity;

        while (offset < totalCount) {
            const response = await Request(queryDef, {
                uri: albumUri,
                locale: "",
                offset: offset,
                limit: limit,
            });

            const albumUnion = response?.data?.albumUnion;
            const tracksContainer = albumUnion?.tracksV2 || albumUnion?.tracks;

            if (!tracksContainer || !Array.isArray(tracksContainer.items)) {
                console.error("[LikeAlbumInOrder] Risposta GraphQL inattesa:", response);
                throw new Error(t("graphQlTracksUnavailable"));
            }

            const items = tracksContainer.items;
            const uris = items
                .map((item) => item?.track?.uri || item?.uri)
                .filter((uri) => typeof uri === "string" && uri.startsWith("spotify:track:"));

            trackUris.push(...uris);

            totalCount = tracksContainer.totalCount ?? uris.length;
            if (items.length === 0) break;
            offset += items.length;
        }

        return trackUris;
    }

    /**
     * Aggiunge i brani dell'album ai Preferiti dall'ultimo al primo
     */
    async function addAlbumReversed(albumUri) {
        if (isProcessing) {
            Spicetify.showNotification(t("operationInProgress"), true);
            return;
        }

        const delayMs = getDelayMs();
        isProcessing = true;
        currentProgressText = "...";
        updateProgressUI(0, 0, false, "add");

        try {
            const trackUris = await fetchAlbumTrackUris(albumUri);

            if (trackUris.length === 0) {
                Spicetify.showNotification(t("noTracksFound"), true);
                isProcessing = false;
                currentProgressText = null;
                updateProgressUI(0, 0, false, "add");
                return;
            }

            const reversedUris = [...trackUris].reverse();
            const total = reversedUris.length;

            for (let i = 0; i < total; i++) {
                const trackUri = reversedUris[i];
                const step = i + 1;

                currentProgressText = `♥ ${step}/${total}`;
                updateProgressUI(step, total, false, "add");

                await Spicetify.Platform.LibraryAPI.add({ uris: [trackUri] });

                if (i < total - 1) {
                    await sleep(delayMs);
                }
            }

            isProcessing = false;
            currentProgressText = null;
            updateProgressUI(total, total, true, "add");
        } catch (error) {
            console.error("[LikeAlbumInOrder] Errore dettagliato:", error);
            Spicetify.showNotification(
                `${t("error")}: ${error.message || t("unableToFetchTracks")}`,
                true
            );
            isProcessing = false;
            currentProgressText = null;
            updateProgressUI(0, 0, false, "add");
        }
    }

    /**
     * Rimuove tutti i brani dell'album dai Preferiti
     */
    async function removeAlbumTracksFromLikes(albumUri) {
        if (isProcessing) {
            Spicetify.showNotification(t("operationInProgress"), true);
            return;
        }

        isProcessing = true;
        currentProgressText = "...";
        updateProgressUI(0, 0, false, "remove");

        try {
            const trackUris = await fetchAlbumTrackUris(albumUri);

            if (trackUris.length === 0) {
                Spicetify.showNotification(t("noTracksFound"), true);
                isProcessing = false;
                currentProgressText = null;
                updateProgressUI(0, 0, false, "remove");
                return;
            }

            const total = trackUris.length;

            for (let i = 0; i < total; i++) {
                const trackUri = trackUris[i];
                const step = i + 1;

                currentProgressText = `✕ ${step}/${total}`;
                updateProgressUI(step, total, false, "remove");

                await Spicetify.Platform.LibraryAPI.remove({ uris: [trackUri] });

                if (i < total - 1) {
                    await sleep(REMOVE_STEP_DELAY_MS);
                }
            }

            isProcessing = false;
            currentProgressText = null;
            updateProgressUI(total, total, true, "remove");
        } catch (error) {
            console.error("[LikeAlbumInOrder] Errore rimozione:", error);
            Spicetify.showNotification(
                `${t("error")}: ${error.message || t("unableToRemoveTracks")}`,
                true
            );
            isProcessing = false;
            currentProgressText = null;
            updateProgressUI(0, 0, false, "remove");
        }
    }

    /**
     * Finestra di dialogo generica (usata sia per aggiunta sul "+" sia per conferma rimozione)
     */
    function showCustomModal({ title, descriptionHtml, confirmText, cancelText, confirmColor, onConfirm }) {
        const existingModal = document.getElementById(MODAL_ID);
        if (existingModal) existingModal.remove();

        const overlay = document.createElement("div");
        overlay.id = MODAL_ID;
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.72);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            backdrop-filter: blur(3px);
        `;

        const dialog = document.createElement("div");
        dialog.dir = isRightToLeft.has(language) ? "rtl" : "ltr";
        dialog.style.cssText = `
            background: var(--spice-card, #282828);
            color: var(--spice-text, #ffffff);
            border-radius: 12px;
            padding: 24px;
            max-width: 420px;
            width: 90%;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65);
            font-family: inherit;
        `;

        dialog.innerHTML = `
            <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: var(--spice-text, #ffffff);">
                ${title}
            </h2>
            <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.5; color: var(--spice-subtext, #b3b3b3);">
                ${descriptionHtml}
            </p>
            <div style="display: flex; justify-content: flex-end; gap: 12px;">
                <button id="${MODAL_ID}-cancel" style="
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 9999px;
                    color: var(--spice-text, #ffffff);
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 700;
                    padding: 8px 20px;
                ">${cancelText}</button>
                <button id="${MODAL_ID}-confirm" style="
                    background: ${confirmColor || "#1ed760"};
                    border: none;
                    border-radius: 9999px;
                    color: #000000;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 700;
                    padding: 8px 20px;
                ">${confirmText}</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const closeModal = () => {
            overlay.remove();
            document.removeEventListener("keydown", onKeyDown);
        };

        const onKeyDown = (e) => {
            if (e.key === "Escape") closeModal();
        };
        document.addEventListener("keydown", onKeyDown);

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeModal();
        });

        dialog.querySelector(`#${MODAL_ID}-cancel`).addEventListener("click", closeModal);
        dialog.querySelector(`#${MODAL_ID}-confirm`).addEventListener("click", () => {
            closeModal();
            onConfirm();
        });
    }

    function triggerConfirmModalOnce(albumUri) {
        if (!getBoolSetting(STORAGE_KEYS.ASK_ON_SAVE, DEFAULT_SETTINGS.askOnSave)) return;

        const now = Date.now();
        if (now - lastModalTriggerTime < 2000) return;
        if (isProcessing) return;

        lastModalTriggerTime = now;
        showCustomModal({
            title: t("addAlbumTitle"),
            descriptionHtml: t("addAlbumDescription"),
            cancelText: t("noJustAlbum"),
            confirmText: t("yesAddTracks"),
            confirmColor: "#1ed760",
            onConfirm: () => addAlbumReversed(albumUri),
        });
    }

    function handleRemoveClick(albumUri) {
        if (getBoolSetting(STORAGE_KEYS.CONFIRM_REMOVE, DEFAULT_SETTINGS.confirmRemove)) {
            showCustomModal({
                title: t("removeAlbumTitle"),
                descriptionHtml: t("removeAlbumDescription"),
                cancelText: t("cancel"),
                confirmText: t("yesRemoveAll"),
                confirmColor: "#f15e6c",
                onConfirm: () => removeAlbumTracksFromLikes(albumUri),
            });
        } else {
            removeAlbumTracksFromLikes(albumUri);
        }
    }

    /**
     * Restituisce l'URI dell'album se siamo nella pagina di un album
     */
    function getCurrentAlbumUri() {
        const pathname = Spicetify.Platform?.History?.location?.pathname || "";
        if (!pathname.startsWith("/album/")) return null;
        const albumId = pathname.split("/album/")[1]?.split("/")[0]?.split("?")[0];
        return albumId ? `spotify:album:${albumId}` : null;
    }

    /**
     * Trova la barra delle azioni dell'album
     */
    function findActionBar() {
        const direct =
            document.querySelector('[data-testid="action-bar-row"]') ||
            document.querySelector(".main-actionBar-ActionBarRow") ||
            document.querySelector(".main-actionBar-ActionBar");
        if (direct) return direct;

        const playBtn = document.querySelector(
            'main [data-testid="play-button"], .Root__main-view [data-testid="play-button"]'
        );
        if (playBtn) {
            return (
                playBtn.closest('[role="presentation"]') ||
                playBtn.parentElement?.parentElement ||
                playBtn.parentElement
            );
        }

        return null;
    }

    /**
     * METODO 1: Intercetta la chiamata API di salvataggio album in libreria
     */
    try {
        const libApi = Spicetify.Platform.LibraryAPI;
        if (libApi && typeof libApi.add === "function") {
            const origAdd = libApi.add.bind(libApi);
            libApi.add = async function (...args) {
                const result = await origAdd(...args);
                try {
                    const firstArg = args[0];
                    const uris = Array.isArray(firstArg?.uris)
                        ? firstArg.uris
                        : Array.isArray(firstArg)
                        ? firstArg
                        : [];
                    const addedAlbumUri = uris.find(
                        (u) => typeof u === "string" && u.startsWith("spotify:album:")
                    );
                    if (addedAlbumUri) {
                        setTimeout(() => triggerConfirmModalOnce(addedAlbumUri), 150);
                    }
                } catch (e) {
                    console.warn("[LikeAlbumInOrder] Errore hook LibraryAPI.add:", e);
                }
                return result;
            };
        }
    } catch (e) {
        console.warn("[LikeAlbumInOrder] Impossibile registrare hook su LibraryAPI:", e);
    }

    /**
     * METODO 2: Intercetta il clic sul pulsante "+" nella barra azioni dell'album
     */
    document.addEventListener(
        "click",
        (event) => {
            const albumUri = getCurrentAlbumUri();
            if (!albumUri) return;

            const clickedBtn = event.target.closest("button");
            if (
                !clickedBtn ||
                clickedBtn.id === LIKE_BUTTON_ID ||
                clickedBtn.id === UNLIKE_BUTTON_ID
            ) {
                return;
            }

            if (
                clickedBtn.closest(`#${MODAL_ID}`) ||
                clickedBtn.closest('[role="row"], [data-testid="tracklist-row"]')
            ) {
                return;
            }

            const actionBar = findActionBar();
            if (!actionBar || !actionBar.contains(clickedBtn)) return;

            const testId = (clickedBtn.dataset.testid || "").toLowerCase();
            const ariaLabel = (clickedBtn.getAttribute("aria-label") || "").toLowerCase();
            const encoreId = (clickedBtn.getAttribute("data-encore-id") || "").toLowerCase();
            const ariaChecked = clickedBtn.getAttribute("aria-checked");
            const ariaPressed = clickedBtn.getAttribute("aria-pressed");
            const btnText = (clickedBtn.textContent || "").trim();

            if (
                testId === "play-button" ||
                encoreId === "buttonprimary" ||
                ariaLabel.includes("play") ||
                ariaLabel.includes("riproduci") ||
                ariaLabel.includes("pausa") ||
                ariaLabel.includes("pause")
            ) {
                return;
            }

            if (
                testId === "more-button" ||
                testId === "context-menu-button" ||
                testId === "shuffle-button" ||
                testId === "download-button" ||
                ariaLabel.includes("shuffle") ||
                ariaLabel.includes("casuale") ||
                ariaLabel.includes("scarica") ||
                ariaLabel.includes("download") ||
                ariaLabel.includes("altre opzioni") ||
                ariaLabel.includes("more options") ||
                ariaLabel.includes("altro per") ||
                clickedBtn.getAttribute("role") === "combobox" ||
                clickedBtn.getAttribute("aria-haspopup") === "listbox" ||
                btnText.length > 0
            ) {
                return;
            }

            const isRemoving =
                ariaChecked === "true" ||
                ariaPressed === "true" ||
                ariaLabel.includes("rimuovi") ||
                ariaLabel.includes("remove");

            if (!isRemoving) {
                setTimeout(() => {
                    triggerConfirmModalOnce(albumUri);
                }, 150);
            }
        },
        true
    );

    /**
     * 1. Voci nel menu contestuale (Tasto destro sull'album o menu '...')
     */
    const MENU_ADD_LABEL = t("menuAdd");
    const MENU_REMOVE_LABEL = t("menuRemove");

    function isAlbumUri(uris) {
        if (uris.length !== 1) return false;
        const uriObj = Spicetify.URI.fromString(uris[0]);
        return uriObj.type === Spicetify.URI.Type.ALBUM;
    }

    new Spicetify.ContextMenu.Item(
        MENU_ADD_LABEL,
        (uris) => addAlbumReversed(uris[0]),
        isAlbumUri,
        "heart"
    ).register();

    new Spicetify.ContextMenu.Item(
        MENU_REMOVE_LABEL,
        (uris) => handleRemoveClick(uris[0]),
        isAlbumUri,
        "x"
    ).register();

    /**
     * Colora di verde e rosso anche le voci dentro il menu dei 3 puntini (...)
     */
    function colorizeContextMenuItems() {
        const menuItems = document.querySelectorAll('#context-menu button[role="menuitem"], [role="menu"] button[role="menuitem"]');
        menuItems.forEach((btn) => {
            const text = (btn.textContent || "").trim();
            if (text === MENU_ADD_LABEL) {
                btn.style.color = "#1ed760";
                btn.querySelectorAll("span, svg").forEach((el) => (el.style.color = "#1ed760"));
            } else if (text === MENU_REMOVE_LABEL) {
                btn.style.color = "#f15e6c";
                btn.querySelectorAll("span, svg").forEach((el) => (el.style.color = "#f15e6c"));
            }
        });
    }

    /**
     * 2. Pulsanti colorati nella barra dell'album (accanto a Play, '+' e '...')
     */
    function styleActionButton(btn, colorHex, bgRgba) {
        btn.style.cssText = `
            background: ${bgRgba};
            border: 1px solid ${colorHex};
            border-radius: 9999px;
            color: ${colorHex};
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            height: 32px;
            padding: 0 14px;
            margin-left: 8px;
            font-size: 13px;
            font-weight: 700;
            white-space: nowrap;
            transition: all 0.15s ease;
        `;

        btn.addEventListener("mouseenter", () => {
            btn.style.background = colorHex;
            btn.style.color = "#000000";
            btn.style.transform = "scale(1.04)";
        });

        btn.addEventListener("mouseleave", () => {
            btn.style.background = bgRgba;
            btn.style.color = colorHex;
            btn.style.transform = "scale(1)";
        });
    }

    function createLikeButton(albumUri) {
        const btn = document.createElement("button");
        btn.id = LIKE_BUTTON_ID;
        btn.dataset.albumUri = albumUri;
        btn.title = t("likeButtonTitle");
        btn.innerHTML = getLikeButtonHtml();
        styleActionButton(btn, "#1ed760", "rgba(30, 215, 96, 0.12)");
        btn.addEventListener("click", () => {
            if (btn.dataset.albumUri) addAlbumReversed(btn.dataset.albumUri);
        });
        return btn;
    }

    function createUnlikeButton(albumUri) {
        const btn = document.createElement("button");
        btn.id = UNLIKE_BUTTON_ID;
        btn.dataset.albumUri = albumUri;
        btn.title = t("unlikeButtonTitle");
        btn.innerHTML = getUnlikeButtonHtml();
        styleActionButton(btn, "#f15e6c", "rgba(241, 94, 108, 0.12)");
        btn.addEventListener("click", () => {
            if (btn.dataset.albumUri) handleRemoveClick(btn.dataset.albumUri);
        });
        return btn;
    }

    function checkAndInjectAlbumButtons() {
        colorizeContextMenuItems(); // Applica i colori al menu '...' quando viene aperto

        // NOTA: Se preferisci avere i pulsanti SOLO dentro il menu dei 3 puntini (...),
        // ti basta togliere il commento alla riga qui sotto:
        // return;

        const albumUri = getCurrentAlbumUri();
        if (!albumUri) return;

        const actionBar = findActionBar();
        if (!actionBar) return;

        // Cerca il pulsante '...' o il pulsante Play dentro la barra azioni (senza dipendere dal tag <main>)
        const anchorBtn =
            actionBar.querySelector('[data-testid="more-button"]') ||
            actionBar.querySelector('[data-testid="context-menu-button"]') ||
            actionBar.querySelector('[data-testid="play-button"]');

        const container = anchorBtn ? anchorBtn.parentElement : actionBar;

        let likeBtn = document.getElementById(LIKE_BUTTON_ID);
        if (likeBtn) {
            likeBtn.dataset.albumUri = albumUri;
        } else {
            likeBtn = createLikeButton(albumUri);
            if (anchorBtn && anchorBtn.nextSibling) {
                container.insertBefore(likeBtn, anchorBtn.nextSibling);
            } else {
                container.appendChild(likeBtn);
            }
        }

        let unlikeBtn = document.getElementById(UNLIKE_BUTTON_ID);
        if (unlikeBtn) {
            unlikeBtn.dataset.albumUri = albumUri;
        } else {
            unlikeBtn = createUnlikeButton(albumUri);
            if (likeBtn.nextSibling) {
                container.insertBefore(unlikeBtn, likeBtn.nextSibling);
            } else {
                container.appendChild(unlikeBtn);
            }
        }
    }

    /**
     * SEZIONE NELLE IMPOSTAZIONI DI SPOTIFY (/preferences)
     */
    function checkAndInjectSettings() {
        const pathname = Spicetify.Platform?.History?.location?.pathname || "";
        if (pathname !== "/preferences") return;

        if (document.getElementById(SETTINGS_SECTION_ID)) return;

        // Individua il contenitore principale della pagina Impostazioni di Spotify
        const settingsHeading = document.querySelector(
            'main h1, .Root__main-view h1, [data-testid="settings-page"] h1'
        );
        const settingsContainer =
            document.querySelector('[data-testid="settings-page"]') ||
            document.querySelector(".x-settings-container") ||
            settingsHeading?.parentElement;

        if (!settingsContainer) return;

        const section = document.createElement("div");
        section.id = SETTINGS_SECTION_ID;
        section.dir = isRightToLeft.has(language) ? "rtl" : "ltr";
        section.style.cssText = `
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            font-family: inherit;
        `;

        const currentDelay = getDelayMs();
        const askOnSave = getBoolSetting(STORAGE_KEYS.ASK_ON_SAVE, DEFAULT_SETTINGS.askOnSave);
        const confirmRemove = getBoolSetting(STORAGE_KEYS.CONFIRM_REMOVE, DEFAULT_SETTINGS.confirmRemove);

        section.innerHTML = `
            <h2 style="font-size: 18px; font-weight: 700; color: var(--spice-text, #ffffff); margin: 0 0 16px 0;">
                ${t("settingsTitle")}
            </h2>

            <!-- Riga 1: Delay in ms -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 10px 0;">
                <div style="flex: 1;">
                    <div style="font-size: 14px; font-weight: 500; color: var(--spice-text, #ffffff);">
                        ${t("delayLabel")}
                    </div>
                    <div style="font-size: 12px; color: var(--spice-subtext, #b3b3b3); margin-top: 2px;">
                        ${t("delayDescription")}
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <input
                        id="${SETTINGS_SECTION_ID}-delay"
                        type="number"
                        min="500"
                        max="10000"
                        step="50"
                        value="${currentDelay}"
                        style="
                            width: 90px;
                            padding: 6px 10px;
                            border-radius: 6px;
                            border: 1px solid rgba(255, 255, 255, 0.25);
                            background: var(--spice-card, #282828);
                            color: var(--spice-text, #ffffff);
                            font-size: 14px;
                            font-weight: 600;
                            text-align: right;
                        "
                    />
                    <span style="font-size: 13px; color: var(--spice-subtext, #b3b3b3);">ms</span>
                </div>
            </div>

            <!-- Riga 2: Chiedi quando si salva un album con il "+" -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 10px 0;">
                <div style="flex: 1;">
                    <div style="font-size: 14px; font-weight: 500; color: var(--spice-text, #ffffff);">
                        ${t("askSaveLabel")}
                    </div>
                    <div style="font-size: 12px; color: var(--spice-subtext, #b3b3b3); margin-top: 2px;">
                        ${t("askSaveDescription")}
                    </div>
                </div>
                <input
                    id="${SETTINGS_SECTION_ID}-ask-save"
                    type="checkbox"
                    ${askOnSave ? "checked" : ""}
                    style="width: 18px; height: 18px; accent-color: #1ed760; cursor: pointer;"
                />
            </div>

            <!-- Riga 3: Conferma prima di rimuovere tutti i Like -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 10px 0;">
                <div style="flex: 1;">
                    <div style="font-size: 14px; font-weight: 500; color: var(--spice-text, #ffffff);">
                        ${t("confirmRemoveLabel")}
                    </div>
                    <div style="font-size: 12px; color: var(--spice-subtext, #b3b3b3); margin-top: 2px;">
                        ${t("confirmRemoveDescription")}
                    </div>
                </div>
                <input
                    id="${SETTINGS_SECTION_ID}-confirm-remove"
                    type="checkbox"
                    ${confirmRemove ? "checked" : ""}
                    style="width: 18px; height: 18px; accent-color: #1ed760; cursor: pointer;"
                />
            </div>
        `;

        settingsContainer.appendChild(section);

        // Event listener per salvare subito le modifiche
        const delayInput = section.querySelector(`#${SETTINGS_SECTION_ID}-delay`);
        delayInput.addEventListener("change", () => {
            const saved = setDelayMs(delayInput.value);
            delayInput.value = saved;
            Spicetify.showNotification(t("delaySaved", { delay: saved }));
        });

        const askSaveCheckbox = section.querySelector(`#${SETTINGS_SECTION_ID}-ask-save`);
        askSaveCheckbox.addEventListener("change", () => {
            setBoolSetting(STORAGE_KEYS.ASK_ON_SAVE, askSaveCheckbox.checked);
        });

        const confirmRemoveCheckbox = section.querySelector(`#${SETTINGS_SECTION_ID}-confirm-remove`);
        confirmRemoveCheckbox.addEventListener("change", () => {
            setBoolSetting(STORAGE_KEYS.CONFIRM_REMOVE, confirmRemoveCheckbox.checked);
        });
    }

    // --- OSSERVATORI DI NAVIGAZIONE E DOM ---
    function onPageUpdate() {
        checkAndInjectAlbumButtons();
        checkAndInjectSettings();
    }

    Spicetify.Platform.History.listen(() => {
        setTimeout(onPageUpdate, 250);
    });

    const observer = new MutationObserver(() => {
        onPageUpdate();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    onPageUpdate();
})();