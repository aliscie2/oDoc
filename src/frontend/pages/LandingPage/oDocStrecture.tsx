import React, { useState } from "react";

import { odocStrecutre } from "./landingPageData";
import { useSelector } from "react-redux";
import RunawayJellyfish from "@/components/creature/runAeayJellyFish";
import LOGOSVG from "@/components/creature/logoSVG";

const LogoText = () => (
  <svg width="85" height="85" viewBox="0 0 93 93" fill="none" x="10.5" y="10.5">
    <path
      d="M7.2147 40.507L7.13774 42.3719C6.89506 42.396 6.67788 42.4567 6.48621 42.554C6.29169 42.6512 6.12434 42.7794 5.98413 42.9385C5.84393 43.0976 5.73389 43.2836 5.65403 43.4964C5.57428 43.7063 5.52925 43.9362 5.51894 44.186C5.50032 44.6373 5.59621 45.0351 5.80663 45.3793C6.01421 45.7233 6.32708 45.9964 6.74524 46.1985C7.16056 46.4004 7.67052 46.5139 8.27512 46.5389C8.89675 46.5645 9.42284 46.4938 9.85339 46.3268C10.2841 46.1569 10.6142 45.9089 10.8437 45.5829C11.0733 45.2568 11.1971 44.8738 11.2153 44.4339C11.2255 44.1869 11.2023 43.9571 11.1456 43.7443C11.0891 43.5288 11.0018 43.3361 10.8837 43.1663C10.7628 42.9964 10.6137 42.8537 10.4365 42.7384C10.2594 42.6202 10.0554 42.535 9.82437 42.4828L9.90985 40.6183C10.3081 40.683 10.6891 40.8196 11.053 41.028C11.4142 41.2334 11.7343 41.5039 12.0133 41.8396C12.2896 42.1723 12.5037 42.565 12.6556 43.0176C12.8048 43.4673 12.8678 43.9718 12.8448 44.531C12.8127 45.3087 12.608 45.9969 12.2307 46.5955C11.8535 47.1912 11.3241 47.6527 10.6424 47.98C9.96085 48.3045 9.14603 48.4471 8.19798 48.408C7.24708 48.3688 6.44549 48.1565 5.79321 47.7714C5.14092 47.3862 4.65286 46.8798 4.32903 46.2523C4.00236 45.6247 3.85484 44.9277 3.88647 44.1613C3.90732 43.656 3.99762 43.1906 4.15735 42.765C4.31719 42.3366 4.54028 41.9605 4.8266 41.6368C5.11008 41.313 5.45201 41.0541 5.85239 40.8603C6.25289 40.6635 6.70699 40.5458 7.2147 40.507ZM13.0796 40.0671L4.66172 37.7638L5.57045 34.4427C5.74439 33.807 6.00657 33.2955 6.35697 32.9084C6.70537 32.5177 7.1187 32.2612 7.59695 32.1387C8.07321 32.0128 8.58947 32.0259 9.14572 32.1781C9.70472 32.3311 10.1526 32.5832 10.4895 32.9346C10.8235 33.2852 11.0348 33.7186 11.1234 34.2346C11.2126 34.748 11.1688 35.328 10.9919 35.9747L10.3834 38.1984L8.95304 37.807L9.48276 35.871C9.57573 35.5313 9.60637 35.2363 9.57469 34.9861C9.543 34.7359 9.44899 34.5305 9.29265 34.3699C9.13706 34.2066 8.92088 34.087 8.64412 34.0113C8.36462 33.9348 8.1136 33.9265 7.89104 33.9864C7.66924 34.0435 7.4779 34.1723 7.31702 34.3728C7.15415 34.5697 7.02586 34.8394 6.93214 35.182L6.60373 36.3822L13.5665 38.2873L13.0796 40.0671ZM10.4927 34.4729L14.8959 33.429L14.3583 35.3937L9.96744 36.3924L10.4927 34.4729ZM7.11033 29.8293L8.08061 28.0045L12.3335 28.0119L12.3735 27.9366L9.98915 24.415L10.9594 22.5901L14.4466 28.0495L17.1707 29.4979L16.3105 31.1159L13.5864 29.6674L7.11033 29.8293ZM18.9871 26.4414L12.386 20.7325L14.6384 18.1282C15.0714 17.6275 15.5359 17.2837 16.0319 17.0967C16.5257 16.9078 17.0213 16.8669 17.5184 16.9738C18.0153 17.0768 18.4829 17.3178 18.9213 17.6969C19.3596 18.076 19.6647 18.5051 19.8363 18.9841C20.008 19.4631 20.0321 19.9628 19.9087 20.4834C19.7872 21.0017 19.5071 21.5145 19.0686 22.0216L17.633 23.6815L16.5145 22.7142L17.755 21.2799C17.9873 21.0113 18.1325 20.7501 18.1906 20.4961C18.2485 20.2381 18.2318 19.9946 18.1407 19.7656C18.0493 19.5325 17.8951 19.3222 17.678 19.1345C17.4589 18.9449 17.2295 18.8236 16.99 18.7704C16.7502 18.7133 16.509 18.7338 16.2664 18.8319C16.0216 18.9282 15.7821 19.1117 15.548 19.3825L14.734 20.3237L20.1941 25.0458L18.9871 26.4414ZM19.1421 15.6137L18.2198 14.4038L23.9202 10.0587L24.8424 11.2686L22.7175 12.8883L27.0859 18.6192L25.6354 19.7249L21.267 13.994L19.1421 15.6137ZM35.0027 9.81289C35.3879 10.6831 35.5507 11.4965 35.4911 12.253C35.4341 13.0084 35.1937 13.6725 34.77 14.2453C34.3477 14.8144 33.7846 15.2548 33.0806 15.5664C32.3715 15.8804 31.6637 16.0011 30.9574 15.9286C30.2511 15.856 29.5992 15.587 29.0016 15.1214C28.404 14.6558 27.9132 13.9893 27.529 13.1216C27.1438 12.2514 26.9797 11.4386 27.0367 10.6832C27.0938 9.92783 27.3334 9.26561 27.7556 8.69653C28.1767 8.12485 28.7419 7.68202 29.4511 7.36806C30.155 7.05639 30.8602 6.93683 31.5665 7.00939C32.2743 7.07819 32.9269 7.34537 33.5245 7.81093C34.1247 8.27534 34.6174 8.94266 35.0027 9.81289ZM33.2921 10.5702C33.0425 10.0065 32.7476 9.5685 32.4074 9.25619C32.0698 8.94273 31.7047 8.75327 31.3123 8.68781C30.9198 8.62234 30.5196 8.67989 30.1118 8.86044C29.7039 9.041 29.3923 9.29857 29.1769 9.63316C28.9616 9.96774 28.8551 10.3659 28.8576 10.8277C28.8627 11.2884 28.9901 11.8006 29.2396 12.3643C29.4892 12.928 29.7828 13.3666 30.1204 13.68C30.4606 13.9923 30.827 14.1812 31.2194 14.2467C31.6119 14.3122 32.0121 14.2546 32.4199 14.0741C32.8278 13.8935 33.1394 13.6359 33.3548 13.3013C33.5701 12.9668 33.6753 12.5691 33.6702 12.1085C33.6677 11.6467 33.5416 11.1339 33.2921 10.5702ZM41.1104 13.0219L39.1443 13.2317L41.2143 4.23404L43.5787 3.98179L47.496 12.3407L45.5299 12.5504L42.6419 6.08737L42.5741 6.0946L41.1104 13.0219ZM40.6236 9.62398L45.2677 9.12854L45.4205 10.5607L40.7764 11.0562L40.6236 9.62398ZM54.0561 7.46593C54.0254 7.25232 53.9675 7.05932 53.8824 6.88693C53.7977 6.71173 53.6855 6.55854 53.5459 6.42737C53.4096 6.29377 53.247 6.18379 53.0582 6.09743C52.8722 6.01145 52.661 5.95211 52.4246 5.91939C51.9828 5.85823 51.5793 5.91422 51.214 6.08737C50.8516 6.2609 50.5484 6.54446 50.3047 6.93805C50.0613 7.32882 49.8979 7.82532 49.8146 8.42753C49.7312 9.02974 49.7518 9.55456 49.8763 10.002C50.0007 10.4494 50.215 10.8075 50.5191 11.0761C50.8236 11.342 51.2038 11.5065 51.6597 11.5696C52.0734 11.6268 52.4367 11.6026 52.7496 11.4967C53.0657 11.3885 53.3198 11.21 53.512 10.9613C53.707 10.7129 53.83 10.4044 53.881 10.0358L54.2449 10.1421L52.0161 9.83359L52.2066 8.4575L55.8241 8.95825L55.6734 10.0473C55.5682 10.8071 55.3174 11.4378 54.9211 11.9393C54.5251 12.438 54.0252 12.7961 53.4215 13.0137C52.8182 13.2285 52.1535 13.2856 51.4275 13.1851C50.617 13.0729 49.9298 12.7957 49.3658 12.3534C48.8022 11.9082 48.3945 11.3313 48.1427 10.6224C47.8941 9.91118 47.833 9.09967 47.9592 8.18791C48.0562 7.4872 48.2439 6.8765 48.5225 6.3558C48.8043 5.83268 49.156 5.40527 49.5776 5.07359C49.9992 4.7419 50.4687 4.51005 50.986 4.37803C51.5033 4.24601 52.0476 4.21953 52.6188 4.29861C53.1085 4.36639 53.5544 4.50125 53.9567 4.7032C54.3593 4.90233 54.7059 5.15394 54.9965 5.45802C55.2899 5.76249 55.516 6.10783 55.6748 6.49404C55.834 6.87744 55.9135 7.2871 55.9134 7.72302L54.0561 7.46593ZM55.8947 13.8558L59.0107 5.70372L62.227 6.93309C62.8426 7.16842 63.3259 7.47938 63.6769 7.86598C64.0316 8.25095 64.2465 8.6874 64.3215 9.17533C64.4003 9.66163 64.3367 10.1741 64.1308 10.7128C63.9238 11.2542 63.6291 11.6752 63.2464 11.9761C62.8648 12.2742 62.4129 12.4421 61.8906 12.4797C61.371 12.5183 60.798 12.4179 60.1717 12.1786L58.0183 11.3554L58.5478 9.97022L60.4226 10.6868C60.7517 10.8126 61.0422 10.872 61.2943 10.8649C61.5464 10.8579 61.76 10.7844 61.9351 10.6445C62.1129 10.5057 62.253 10.3022 62.3555 10.0342C62.4589 9.76355 62.4917 9.51454 62.454 9.2872C62.4188 9.06087 62.3094 8.85785 62.1256 8.67813C61.9456 8.49677 61.6897 8.34269 61.358 8.2159L60.1957 7.77162L57.6182 14.5146L55.8947 13.8558ZM61.7151 11.8287L62.3232 16.313L60.4205 15.5857L59.8563 11.1182L61.7151 11.8287ZM62.602 16.5912L67.3711 9.28225L72.2961 12.4958L71.4648 13.7699L68.0851 11.5646L66.9487 13.3062L70.075 15.3461L69.2437 16.6202L66.1174 14.5803L64.9787 16.3255L68.3726 18.54L67.5413 19.8141L62.602 16.5912ZM68.15 20.3879L74.2527 14.1491L78.4566 18.2612L77.3928 19.3487L74.5079 16.5268L73.0538 18.0134L75.7223 20.6238L74.6585 21.7113L71.99 19.101L70.5328 20.5906L73.4299 23.4244L72.3661 24.5119L68.15 20.3879ZM80.2666 20.6684L81.4517 22.611L77.6977 27.7165L77.751 27.8038L84.0083 26.8018L85.1934 28.7445L77.7431 33.2895L76.811 31.7616L81.6602 28.8033L81.6225 28.7415L75.6334 29.7495L74.9987 28.7091L78.6536 23.8338L78.6158 23.772L73.7484 26.7414L72.8163 25.2135L80.2666 20.6684ZM78.0252 34.1149L86.3732 31.5701L88.088 37.1952L86.6328 37.6388L85.456 33.7787L83.4669 34.3851L84.5554 37.9558L83.1002 38.3994L82.0117 34.8287L80.0184 35.4363L81.2001 39.3128L79.7449 39.7564L78.0252 34.1149ZM89.0627 47.2292L80.3589 47.869L80.2421 46.2796L85.4418 42.0902L85.4372 42.0265L79.959 42.4292L79.8238 40.589L88.5276 39.9492L88.6463 41.5641L83.4486 45.7234L83.4542 45.7999L88.9281 45.3975L89.0627 47.2292ZM87.4079 49.6175L88.9086 49.8672L87.7322 56.9376L86.2315 56.6879L86.6701 54.0523L79.5618 52.8696L79.8612 51.0705L86.9694 52.2532L87.4079 49.6175Z"
      fill={"#FFEFCE"}
    />
    <path
      d="M33.804 81.7428C33.3382 82.7507 32.751 83.5199 32.0422 84.0504C31.3364 84.5823 30.5693 84.8832 29.741 84.9533C28.9171 85.0217 28.0975 84.8675 27.2821 84.4908C26.4607 84.1112 25.8098 83.5841 25.3293 82.9093C24.8488 82.2346 24.5823 81.4561 24.5299 80.5739C24.4775 79.6916 24.6835 78.7481 25.1478 77.7431C25.6135 76.7352 26.1993 75.9653 26.9051 75.4334C27.6109 74.9015 28.3757 74.6014 29.1996 74.533C30.0249 74.4616 30.8482 74.6156 31.6696 74.9952C32.485 75.3719 33.1329 75.8977 33.6134 76.5724C34.0984 77.2456 34.367 78.0232 34.4194 78.9055C34.4748 79.7891 34.2697 80.7348 33.804 81.7428ZM31.8227 80.8273C32.1244 80.1744 32.281 79.5786 32.2926 79.04C32.3071 78.5027 32.1919 78.0369 31.947 77.6426C31.702 77.2482 31.3433 76.9419 30.8709 76.7237C30.3986 76.5054 29.9329 76.4308 29.4738 76.4998C29.0147 76.5688 28.5838 76.7823 28.1811 77.1403C27.7814 77.4996 27.4307 78.0057 27.1291 78.6586C26.8274 79.3115 26.6693 79.9066 26.6547 80.4439C26.6431 80.9825 26.7598 81.449 27.0048 81.8433C27.2498 82.2377 27.6084 82.544 28.0808 82.7622C28.5532 82.9805 29.0189 83.0551 29.478 82.9861C29.937 82.9171 30.3664 82.7029 30.7661 82.3436C31.1688 81.9856 31.521 81.4802 31.8227 80.8273ZM39.2616 88.3561L35.6788 87.9185L36.9131 77.8118L40.5254 78.2529C41.542 78.3771 42.3924 78.6863 43.0767 79.1806C43.7613 79.6715 44.255 80.3178 44.5578 81.1194C44.8639 81.9214 44.9529 82.8472 44.8247 83.8967C44.6961 84.9495 44.3866 85.8299 43.8961 86.538C43.4089 87.2465 42.7705 87.7578 41.9808 88.0721C41.1944 88.3868 40.288 88.4814 39.2616 88.3561ZM38.0392 86.3486L39.3963 86.5144C40.028 86.5915 40.573 86.5445 41.0313 86.3734C41.4933 86.1995 41.8618 85.8889 42.1368 85.4416C42.4155 84.9915 42.6008 84.3897 42.6928 83.6363C42.784 82.8895 42.7483 82.2658 42.5858 81.7651C42.4265 81.2648 42.145 80.8765 41.7413 80.6002C41.3377 80.3238 40.82 80.1471 40.1883 80.0699L38.8263 79.9036L38.0392 86.3486ZM56.7564 82.4744C56.9627 83.5654 56.9314 84.5326 56.6624 85.3762C56.3968 86.2191 55.9471 86.9095 55.3135 87.4476C54.6825 87.9818 53.9258 88.3323 53.0432 88.4991C52.1541 88.6672 51.318 88.6161 50.535 88.3459C49.752 88.0757 49.0829 87.5967 48.5279 86.9089C47.9729 86.2212 47.5925 85.3334 47.3869 84.2457C47.1806 83.1547 47.2103 82.1877 47.476 81.3448C47.7417 80.5019 48.19 79.8134 48.821 79.2792C49.4513 78.7418 50.2111 78.389 51.1001 78.2209C51.9827 78.0541 52.8155 78.1058 53.5986 78.376C54.3843 78.6424 55.0546 79.1194 55.6096 79.8072C56.1679 80.4943 56.5502 81.3834 56.7564 82.4744ZM54.6119 82.8798C54.4783 82.1731 54.2598 81.5971 53.9564 81.1519C53.6562 80.7061 53.2919 80.3938 52.8635 80.215C52.435 80.0363 51.9651 79.9953 51.4538 80.0919C50.9425 80.1886 50.5201 80.3983 50.1864 80.7211C49.8528 81.0439 49.626 81.468 49.5061 81.9932C49.3894 82.5179 49.3978 83.1336 49.5314 83.8403C49.665 84.547 49.8819 85.1232 50.1821 85.5691C50.4855 86.0143 50.8514 86.3263 51.2799 86.505C51.7083 86.6838 52.1782 86.7248 52.6895 86.6281C53.2008 86.5315 53.6233 86.3218 53.9569 85.999C54.2905 85.6762 54.5157 85.2524 54.6324 84.7278C54.7523 84.2025 54.7455 83.5865 54.6119 82.8798ZM66.8808 76.4598L64.9406 77.4483C64.7772 77.2154 64.5913 77.0293 64.3827 76.89C64.1726 76.7479 63.9466 76.651 63.7046 76.5995C63.4626 76.5479 63.2105 76.5424 62.9485 76.583C62.6894 76.622 62.4299 76.7077 62.17 76.8401C61.7004 77.0793 61.3509 77.4044 61.1213 77.8152C60.8901 78.2231 60.7915 78.6975 60.8252 79.2382C60.8574 79.7761 61.0338 80.3595 61.3543 80.9885C61.6838 81.6353 62.0566 82.1297 62.4728 82.472C62.8919 82.8127 63.3329 83.0065 63.7957 83.0534C64.2585 83.1003 64.7188 83.0071 65.1765 82.7739C65.4335 82.643 65.6539 82.4879 65.8378 82.3086C66.0247 82.1279 66.1707 81.9289 66.2758 81.7117C66.3793 81.4915 66.4391 81.2583 66.455 81.0121C66.4739 80.7645 66.4438 80.5083 66.3647 80.2435L68.3095 79.2638C68.4714 79.7058 68.5505 80.1714 68.5468 80.6606C68.5446 81.1453 68.4526 81.6255 68.2709 82.1012C68.0907 82.5725 67.8139 83.0148 67.4405 83.4282C67.0686 83.8372 66.5917 84.1899 66.01 84.4863C65.2008 84.8986 64.384 85.0841 63.5595 85.0429C62.738 85.0002 61.9659 84.7259 61.2431 84.22C60.5234 83.7126 59.9122 82.9657 59.4096 81.9793C58.9056 80.99 58.6628 80.0536 58.6813 79.17C58.6998 78.2864 58.9355 77.5005 59.3883 76.8123C59.8396 76.1211 60.4639 75.5723 61.2613 75.1661C61.7869 74.8982 62.3118 74.7238 62.836 74.6428C63.363 74.5602 63.873 74.5719 64.3659 74.6779C64.8574 74.7809 65.3161 74.9805 65.7423 75.2767C66.1715 75.5713 66.5509 75.9657 66.8808 76.4598Z"
      fill="#FFEFCE"
    />
  </svg>
);

const OdocIcon = ({ style, ...props }) => {
  const { isDarkMode } = useSelector((state: any) => state.uiState);

  const iconColor = isDarkMode ? "#024B6D" : "#428687";
  //  const textColor = isDarkMode ? "#ffffff" : "#1f2937";

  const pipes =
    "94.1235,103.73,15,3.34185,-45 94.1235 103.73|82.7773,89.5554,11,18.046,-45 82.7773 89.5554|79,88.6066,15,3.34185,-45 79 88.6066|104.73,13.9696,15,3.34185,-135 104.73 13.9696|90.5554,25.3158,11,18.046,-135 90.5554 25.3158|89.6066,29.0931,15,3.34185,-135 89.6066 29.0931|12.9697,2.36304,15,3.34185,135 12.9697 2.36304|24.3159,16.5377,11,18.046,135 24.3159 16.5377|28.0931,17.4865,15,3.34185,135 28.0931 17.4865|3.36304,95.1235,15,3.34185,45 3.36304 95.1235|17.5377,83.7773,11,18.046,45 17.5377 83.7773|18.4865,80,15,3.34185,45 18.4865 80";

  const mainPipes =
    "45,3,15,7|45,97,15,7|3,61,15,7,-90 3 61|96,62,15,7,-90 96 62";

  const smallTeeth =
    "67,95.0048,7.85189,3.63697,-22.5 67 95.0048|68.3918,8,7.85189,3.63697,22.5 68.3918 8|33.3918,93,7.85189,3.63697,22.5 33.3918 93|32,11.0048,7.85189,3.63697,-22.5 32 11.0048|9,37.2542,7.85189,3.63697,-67.5 9 37.2542|12.3601,69,7.85189,3.63697,67.5 12.3601 69|95.3601,32,7.85189,3.63697,67.5 95.3601 32|91,74.2542,7.85189,3.63697,-67.5 91 74.2542";

  const renderRects = (data, prefix) =>
    data.split("|").map((s, i) => {
      const [x, y, w, h, t] = s.split(",");
      return (
        <rect
          key={`${prefix}-${i}`}
          x={x}
          y={y}
          width={w}
          height={h}
          {...(t && { transform: `rotate(${t})` })}
          fill={iconColor}
        />
      );
    });

  return (
    <div>
      {" "}
      <svg
        style={style}
        width="220"
        height="221"
        viewBox="0 0 108 109"
        fill={iconColor}
        {...props}
      >
        <ellipse
          cx="44"
          cy="44.5"
          rx="44"
          ry="44.5"
          transform="matrix(-1 0 0 1 97 9)"
          fill={iconColor}
        />
        {renderRects(pipes, "pipe")}
        {renderRects(mainPipes, "main")}
        {renderRects(smallTeeth, "tooth")}
        <LogoText />
      </svg>
      <div
        style={{
          position: "absolute",
          top: "17px",
          left: "5px",
        }}
      >
        <RunawayJellyfish
          LogoSvg={LOGOSVG}
          jellyfishOffsetX={-115}
          jellyfishOffsetY={40}
          scale={0.7}
          logoSvgScale={0.5}
        />
      </div>
    </div>
  );
};

const OdocStructure = () => {
  const { isDarkMode } = useSelector((state: any) => state.uiState);
  const [hoveredElement, setHoveredElement] = useState(null);
  const [coreActive, setCoreActive] = useState(false);

  const getElementPosition = (angle, radius) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius,
    };
  };

  const getAdjustedCardPosition = (angle, radius) => {
    const basePosition = getElementPosition(angle, radius);
    const cardWidth = 280;
    const cardHeight = 200;
    const padding = 20;
    const { innerWidth: viewportWidth, innerHeight: viewportHeight } = window;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;

    let actualX = centerX + basePosition.x;
    let actualY = centerY + basePosition.y;

    actualX = Math.max(
      cardWidth / 2 + padding,
      Math.min(actualX, viewportWidth - cardWidth / 2 - padding),
    );
    actualY = Math.max(
      cardHeight / 2 + padding,
      Math.min(actualY, viewportHeight - cardHeight / 2 - padding),
    );

    return {
      x: actualX - centerX,
      y: actualY - centerY,
    };
  };

  const getThemeColors = () => ({
    cardBg: isDarkMode ? "rgba(26, 26, 26, 0.95)" : "rgba(255, 255, 255, 0.95)",
    pipeBg: isDarkMode
      ? "linear-gradient(90deg, #1a1a1a, #2a2a2a, #1a1a1a)"
      : "linear-gradient(90deg, #f5f5f5, #e0e0e0, #f5f5f5)",
    textColor: isDarkMode ? "#ffffff" : "#1f2937",
    borderColor: isDarkMode ? "#ffffff" : "#000000",
    pipeOpacity: isDarkMode ? 0.1 : 0.3,
  });

  const renderEnergyPipe = (element, radius, isHovered, colors) => (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transformOrigin: "left center",
        height: "16px",
        width: `${radius}px`,
        transform: `rotate(${element.angle}deg)`,
        overflow: "hidden",
        borderRadius: "8px",
        background: `${element.glowColor}20`,
        backdropFilter: "blur(5px)",
        border: `2px solid ${element.glowColor}`,
        opacity: isHovered ? 1 : 0.8,
        boxShadow: isHovered
          ? `0 0 30px ${element.glowColor}`
          : `0 0 15px ${element.glowColor}`,
        zIndex: 5,
        transition: "all 0.3s ease",
      }}
      onMouseEnter={() => setHoveredElement(element.id)}
      onMouseLeave={() => setHoveredElement(null)}
    >
      <div
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          background: `linear-gradient(90deg, transparent 0%, ${element.glowColor} 20%, ${element.glowColor} 50%, ${element.glowColor} 80%, transparent 100%)`,
          borderRadius: "6px",
          animation: `energyFlow 2s linear infinite ${element.id * 0.5}s`,
          opacity: 0.6,
        }}
      />
    </div>
  );

  const renderWifiConnection = (element, position, isHovered) => {
    const isLeft = element.id === 6;

    return (
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
          zIndex: 15,
          width: "200px",
          height: "200px",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "8px",
            height: "8px",
            background: element.glowColor || "#00ff00",
            borderRadius: "50%",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1,
          }}
        />

        {[1, 2, 3].map((ring) => (
          <div
            key={ring}
            style={{
              position: "absolute",
              width: `${30 + ring * 30}px`,
              height: `${30 + ring * 30}px`,
              border: `3px solid ${element.glowColor || "#00ff00"}`,
              borderRadius: "50%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              borderRightColor: isLeft
                ? element.glowColor || "#00ff00"
                : "transparent",
              borderBottomColor: "transparent",
              borderLeftColor: isLeft
                ? "transparent"
                : element.glowColor || "#00ff00",
              borderTopColor: "transparent",
              opacity: 0,
              animation: `wifiPulse 2s ease-in-out infinite ${element.id * 0.5 + ring * 0.3}s`,
            }}
          />
        ))}

        <style jsx>{`
          @keyframes wifiPulse {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.5);
            }
            50% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(1.5);
            }
          }
        `}</style>
      </div>
    );
  };

  const renderCard = (element, colors, isHovered) => (
    <div
      style={{
        width: isHovered ? "280px" : "80px",
        height: isHovered ? "auto" : "80px",
        padding: isHovered ? "24px" : "0",
        borderRadius: isHovered ? "20px" : "50%",
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: isHovered ? "flex-start" : "center",
        justifyContent: isHovered ? "flex-start" : "center",
        transition: "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
          animation: "shimmer 3s ease-in-out infinite",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isHovered ? "16px" : "0",
          marginBottom: isHovered ? "16px" : "0",
          position: "relative",
          zIndex: 1,
          width: "100%",
          justifyContent: isHovered ? "flex-start" : "center",
          transition: "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        <span
          style={{
            fontSize: "32px",
            filter: `contrast(2) brightness(${isDarkMode ? "1.1" : "0.5"})`,
          }}
        >
          {element.icon}
        </span>

        <div
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? "translateX(0)" : "translateX(-20px)",
            transition: "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            width: isHovered ? "auto" : "0",
            overflow: "hidden",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "600",
              color: "currentColor",
              opacity: 0.9,
              whiteSpace: "nowrap",
            }}
          >
            {element.title}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "currentColor",
              opacity: 0.6,
              whiteSpace: "nowrap",
            }}
          >
            {element.subtitle}
          </p>
        </div>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: "14px",
          lineHeight: "1.5",
          color: "currentColor",
          opacity: isHovered ? 0.8 : 0,
          transform: isHovered ? "translateY(0)" : "translateY(10px)",
          position: "relative",
          zIndex: 1,
          transition: "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          maxHeight: isHovered ? "200px" : "0",
          overflow: "hidden",
        }}
      >
        {element.description}
      </p>
    </div>
  );

  const colors = getThemeColors();
  const radius = window.innerWidth < 1024 ? 250 : 300;

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.3,
          background:
            "radial-gradient(circle at 30% 70%, rgba(0, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255, 0, 255, 0.1) 0%, transparent 50%)",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "1200px",
          height: "100%",
          maxHeight: "1200px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        >
          <OdocIcon
            style={{
              width: window.innerWidth < 1024 ? "150px" : "200px",
              filter: `drop-shadow(0 0 8px rgba(0, 200, 255, 0.8)) brightness(${coreActive ? "1.2" : "1"})`,
              transition: "all 0.3s ease",
              animation: "shineGlow 2s ease-in-out infinite",
            }}
          />
        </div>

        {odocStrecutre.map((element, index) => {
          const position = getElementPosition(element.angle, radius);
          const adjustedPosition = getAdjustedCardPosition(
            element.angle,
            radius,
          );
          const isHovered = hoveredElement === element.id;
          const hasEnergyPipe = element.id !== 5 && element.id !== 6;

          return (
            <React.Fragment key={element.id}>
              {hasEnergyPipe
                ? renderEnergyPipe(element, radius, isHovered, colors)
                : renderWifiConnection(element, position, isHovered, index)}

              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, -50%) translate(${isHovered ? adjustedPosition.x : position.x}px, ${isHovered ? adjustedPosition.y : position.y}px)`,
                  transition: "transform 0.4s ease",
                  zIndex: isHovered ? 200 : 20,
                }}
              >
                <div
                  onMouseEnter={() => setHoveredElement(element.id)}
                  onMouseLeave={() => setHoveredElement(null)}
                  style={{
                    transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    cursor: "pointer",
                    transform: "scale(1)",
                    transformOrigin: "center",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: "-20px",
                      borderRadius: "50%",
                      background: `radial-gradient(circle, ${element.glowColor}40 0%, ${element.glowColor}20 40%, transparent 70%)`,
                      opacity: isHovered ? 0.8 : 0.3,
                      filter: "blur(15px)",
                      transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      transform: isHovered ? "scale(1.5)" : "scale(1)",
                      backdropFilter: "blur(10px)",
                    }}
                  />

                  {renderCard(element, colors, isHovered)}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <style>{`

      
 @keyframes shineGlow {
   0%, 100% { filter: drop-shadow(0 0 8px blue); }
   50% { filter: drop-shadow(0 0 25px red); }
 }
 @keyframes energyFlow {
     0% { transform: translateX(100%) scaleX(0); opacity: 0; }
  50% { transform: translateX(0%) scaleX(1); opacity: 1; }
  100% { transform: translateX(-100%) scaleX(0); opacity: 0; }

 }
 @keyframes wifiPulse1 {
   0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
   50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
 }
 @keyframes wifiPulse2 {
   0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
   50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.05); }
 }
 @keyframes wifiPulse3 {
   0%, 100% { opacity: 0.1; transform: translate(-50%, -50%) scale(1); }
   50% { opacity: 0.4; transform: translate(-50%, -50%) scale(1.02); }
 }
 @keyframes shimmer {
   0%, 100% { transform: translateX(-100%); }
   50% { transform: translateX(100%); }
 }
`}</style>
    </div>
  );
};
export default OdocStructure;
