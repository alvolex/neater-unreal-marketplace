export interface MarketplaceData {
 elements:        Element[];
 paging:          Paging;
 recommendOffers: RecommendOffer[];
}

export interface Element {
 bundle:          boolean;
 catalogItemId:   string;
 categories:      Category[] | null;
 commentRatingId: string;
 description:     string;
 downloadable:    boolean;
 id:              string;
 isCatalogItem:   boolean;
 keyImages:       KeyImage[];
 learnThumbnail:  null | string;
 namespace:       Namespace;
 owned:           boolean;
 rating:          Rating;
 ratingId:        string;
 reviewed:        boolean;
 seller:          Seller;
 thumbnail:       null | string;
 title:           string;
}

export interface Category {
 name: string;
 path: string;
}

export interface KeyImage {
 height:       number;
 md5:          string;
 size:         number;
 type:         Type;
 uploadedDate: Date;
 url:          string;
 width:        number;
}

export enum Type {
 ComingSoon = "ComingSoon",
 ComingSoonSmall = "ComingSoon_Small",
 Featured = "Featured",
 Image894X488 = "Image_894x488",
 NewFeatured = "NewFeatured",
 Screenshot = "Screenshot",
 Snapshot = "Snapshot",
 Thumbnail = "Thumbnail",
}

export enum Namespace {
 Ue = "ue",
}

export interface Rating {
 averageRating:   number;
 legacyRatingNum: number;
 rating1:         number;
 rating1Percent:  number;
 rating2:         number;
 rating2Percent:  number;
 rating3:         number;
 rating3Percent:  number;
 rating4:         number;
 rating4Percent:  number;
 rating5:         number;
 rating5Percent:  number;
 targetId:        string;
 total:           number;
}

export interface Seller {
 accepted?:            Accepted[];
 blog?:                string;
 facebook?:            string;
 financeCheckExempted: boolean;
 id:                   string;
 name:                 string;
 noAi:                 boolean;
 otherLink?:           string;
 owner:                string;
 status:               Status;
 supportEmail?:        string;
 twitter?:             string;
 website?:             string;
}

export interface Accepted {
 custom: boolean;
 ns:     Namespace;
}

export enum Status {
 Active = "ACTIVE",
 Discontinued = "DISCONTINUED",
 Restricted = "RESTRICTED",
}

export interface Paging {
 count: number;
 start: number;
 total: number;
}

export interface RecommendOffer {
 bundle:             boolean;
 canPurchase:        boolean;
 catalogItemId:      string;
 categories:         Category[];
 commentRatingId:    string;
 compatibleApps:     any[];
 currencyCode:       string;
 description:        string;
 discount:           string;
 discountPercentage: number;
 discountPrice:      string;
 discountPriceValue: number;
 discounted:         boolean;
 effectiveDate:      Date;
 featured:           string;
 free:               boolean;
 headerImage:        string;
 id:                 string;
 isCatalogItem:      boolean;
 isFeatured:         boolean;
 isNew:              boolean;
 keyImages:          KeyImage[];
 klass:              string;
 learnThumbnail:     string;
 longDescription:    string;
 namespace:          Namespace;
 owned:              boolean;
 ownedCount:         number;
 platforms:          any[];
 price:              string;
 priceValue:         number;
 purchaseLimit:      number;
 rating?:            Rating;
 ratingId:           string;
 recurrence:         string;
 reviewed:           boolean;
 seller:             Seller;
 status:             Status;
 tags:               number[];
 tax:                number;
 technicalDetails:   string;
 thumbnail:          string;
 title:              string;
 urlSlug:            string;
 voucherDiscount:    number;
}
