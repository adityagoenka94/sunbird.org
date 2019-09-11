import { Injectable, EventEmitter } from '@angular/core';
import { Observable, of as observableOf } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ConfigService, ServerResponse, ICard, NavigationHelperService, ResourceService, BrowserCacheTtlService
} from '@sunbird/shared';
import { ContentService, PublicDataService, UserService } from '@sunbird/core';
import { IDeleteParam } from '../../../workspace/interfaces/delteparam';
import { Router } from '@angular/router';
import * as _ from 'lodash-es';
import { CacheService } from 'ng2-cache-service';
@Injectable()

// @Injectable({
//   providedIn: 'root'
// })
export class MyassetsService {
/**
  * reference of config service.
  */
 public config: ConfigService;
 /**
  * Reference of content service.
 */
 public content: ContentService;
 /**
   * To navigate to other pages
 */
 route: Router;
 public listener;
 public showWarning;
 public browserBackEvent = new EventEmitter();
 /**
   * Constructor - default method of WorkSpaceService class
   *
   * @param {ConfigService} config ConfigService reference
   * @param {UserService} userService userService reference
   * @param {HttpClient} http HttpClient reference
 */
 constructor(config: ConfigService, content: ContentService,
   route: Router, public navigationHelperService: NavigationHelperService,
   private cacheService: CacheService, private browserCacheTtlService: BrowserCacheTtlService,
   private resourceService: ResourceService, public publicDataService: PublicDataService,
   public userService: UserService) {
   this.content = content;
   this.config = config;
   this.route = route;
 }
 /**
 * deleteContent
 * delete  content based on contentId
 * @param {contentIds}  contentIds - contentIds
 */
 deleteContent(requestParam: IDeleteParam): Observable<ServerResponse> {
   const option = {
     url: this.config.urlConFig.URLS.CONTENT.RETIRE,
     data: {
       'request': {
         'contentIds': requestParam.contentIds
       }
     }
   };
   return this.content.delete(option);
 }


 /**
* openContentEditor
* open content editor based content mime type
* @param {Object}  content - content
* @param {string}  state - Present state
*/
 navigateToContent(content, state) {
   this.navigationHelperService.storeWorkSpaceCloseUrl();
   const mimeType = content.mimeType;
   if (mimeType === 'application/vnd.ekstep.content-collection') {
     this.openCollectionEditor(content, state);
   } else if (mimeType === 'application/vnd.ekstep.ecml-archive') {
     this.openContent(content, state);
   } else if ((this.config.appConfig.WORKSPACE.genericMimeType).includes(mimeType)) {
     this.openGenericEditor(content, state);
   }
 }
 /**
 * collectionEditor
 * @param {Object}  content - content
 * @param {string}  state - Present state
*/
 openCollectionEditor(content, state) {
   const navigationParams = ['/workspace/content/edit/collection', content.identifier, content.contentType, state, content.framework];
   if (content.status) {
     navigationParams.push(content.status);
   }
   this.route.navigate(navigationParams);
 }

 /**
  * contentEditor
  * @param {Object}  content - content
  * @param {string}  state - Present state
 */
 openContent(content, state) {
   if (this.config.appConfig.WORKSPACE.states.includes(state)) {
     const navigationParams = ['/workspace/content/edit/content/', content.identifier, state, content.framework];
     if (content.status) {
       navigationParams.push(content.status);
     }
     this.route.navigate(navigationParams);
   } else {
     if (state === 'upForReview') {
       this.route.navigate(['workspace/content/upForReview/content', content.identifier]);
     } else if (state === 'flagged') {
       this.route.navigate(['workspace/content/flag/content', content.identifier]);
     } else if (state === 'review') {
       this.route.navigate(['workspace/content/review/content', content.identifier]);
     } else if (state === 'flagreviewer') {
       this.route.navigate(['workspace/content/flagreviewer/content', content.identifier]);
     }
   }
 }
 /**
  * genericEditor
  * State transaction to generic editor
  * @param {Object}  content - content
  * @param {string}  state - Present state
 */
 openGenericEditor(content, state) {
   if (this.config.appConfig.WORKSPACE.states.includes(state)) {
     const navigationParams = ['/workspace/content/edit/generic/', content.identifier, state, content.framework];
     if (content.status) {
       navigationParams.push(content.status);
     }
     this.route.navigate(navigationParams);
   } else {
     if (state === 'review') {
       this.route.navigate(['workspace/content/review/content', content.identifier]);
     } else if (state === 'upForReview') {
       this.route.navigate(['workspace/content/upForReview/content', content.identifier]);
     } else if (state === 'flagged') {
       this.route.navigate(['workspace/content/flag/content', content.identifier]);
     } else if (state === 'flagreviewer') {
       this.route.navigate(['workspace/content/flagreviewer/content', content.identifier]);
     }
   }
 }

 getDataForCard(data, staticData, dynamicFields, metaData) {
   const list: Array<ICard> = [];
   _.forEach(data, (item, key) => {
     const card = {
       name: item.name,
       image: item.appIcon,
       description: item.description,
       lockInfo: item.lockInfo
     };
     _.forIn(staticData, (value, key1) => {
       card[key1] = value;
     });
     _.forIn(metaData, (value, key1) => {
       card[key1] = _.pick(item, value);
     });
     _.forIn(dynamicFields, (fieldData, fieldName) => {
       const value = _.pick(item, fieldData);
       _.forIn(value, (val1, key1) => {
         const name = _.zipObjectDeep([fieldName], [val1]);
         _.forIn(name, (values, index) => {
           card[index] = _.merge(name[index], card[index]);
         });
       });
     });
     list.push(card);
   });
   return <ICard[]>list;
 }

 toggleWarning(type?: string) {
   this.showWarning = sessionStorage.getItem('inEditor');
   if (this.showWarning === 'true') {
     this.listener = (event) => {
       window.location.hash = 'no';
       if (event.state) {
         const alertMsg = type ? this.resourceService.messages.imsg.m0038 + ' ' + type + ', ' + this.resourceService.messages.imsg.m0039
           : this.resourceService.messages.imsg.m0037;
         this.browserBackEvent.emit();
         alert(alertMsg);
         window.location.hash = 'no';
       }
     };
     window.addEventListener('popstate', this.listener, false);
   } else {
     window.location.hash = '';
     window.removeEventListener('popstate', this.listener);
   }
 }

 /**
   * @param {formType} content form type
   * @param {formAction} content form action type
   * @param {selectedContent} content selected content type
   */
 getFormData(formInputParams): Observable<ServerResponse> {
   const pageData: any = this.cacheService.get(formInputParams.formAction + formInputParams.subType);
   if (pageData) {
     return observableOf(pageData);
   } else {
     const channelOptions = {
       url: this.config.urlConFig.URLS.dataDrivenForms.READ,
       data: {
         request: {
           type: formInputParams.formType,
           action: formInputParams.formAction,
           subType: formInputParams.subType,
           rootOrgId: this.userService.hashTagId
         }
       }
     };
     return this.publicDataService.post(channelOptions).pipe(map((data) => {
       this.setData(data, formInputParams.formAction + formInputParams.subType);
       return data;
     }));
   }
 }

 /**
  * getLockList.
  *
  * @param {SearchParam} requestParam api request data
 */
 getContentLockList(requestParam): Observable<ServerResponse> {
   const option = {
     url: this.config.urlConFig.URLS.CONTENT.LOCK_LIST,
     data: {
       request: {
         filters: requestParam.filters
       }
     }
   };
   return this.content.post(option);
 }

 lockContent(inputParams): Observable<ServerResponse> {
   const option = {
     url: this.config.urlConFig.URLS.CONTENT.LOCK_CREATE,
     data: {
       request: inputParams
     }
   };
   return this.content.post(option);
 }
 uploadPreSigned(inputParams, file) {
   console.log('input', inputParams, file);
   const option = {
     url: inputParams,
     fileList: file
   };
   return this.content.put(option);
 }

 retireLock(inputParams): Observable<ServerResponse> {
   const option = {
     url: this.config.urlConFig.URLS.CONTENT.LOCK_RETIRE,
     data: {
       request: inputParams
     }
   };
   return this.content.delete(option);
 }

 setData(data, name) {
   this.cacheService.set(name, data, {
     maxAge: this.browserCacheTtlService.browserCacheTtl
   });
 }
 createAsset(inputParams) {
  const option = {
    url: this.config.urlConFig.URLS.ASSET.CREATEASSET,
    data: {
      'request': inputParams
  }
};
  return this.content.create(option);
}
updateAsset(inputParams) {
  const option = {
    url: `${this.config.urlConFig.URLS.ASSET.UPDATEASSET}/${inputParams.asset.identifier}`,
    data: {
      'request': inputParams
  }
};
  return this.content.update(option);
}

 }

