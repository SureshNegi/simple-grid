var myGrid = angular.module('simple.grid', []);
myGrid.run(['$templateCache', function ($templateCache) {     
    $templateCache.put('MyTimeApp/custom-grid',
     "<div ><div  ng-style=\"{'height':conf.dataHeight}\" oncontextmenu=\"return false\" style=\"position:relative\" class=\" my-grid-container cepFavDataDiv\"><table id=\"cepFavTblGrid\"" +
     "class=\"my-grid-table table-bordered table-striped\"  border=\"0\" cellpadding=\"0\" cellspacing=\"0\">" +
      "<thead><tr id=\"tblHead\" ></tr></thead><tbody id=\"tblBody\"></tbody></table></div><div ng-transclude></div><div id='cusGridPager'></div></div>"
    )
}]);
myGrid.directive('angTable', ['$compile', '$filter',
   function ($compile, $filter) {
       var nonResizableCol = [];
       var getTotalPages = function (totalItems, pageSize) {
           return (totalItems === 0) ? 1 : Math.ceil(totalItems / pageSize);
       }
       return {
           restrict: 'E',
           templateUrl: "MyTimeApp/custom-grid",
           replace: false,
           transclude: true,
           scope: {
               conf: "=",
               onRemoveFav: "=",
               onSortData: "=",
               onSelectCep: "=",
               height: "=",
               enablePaging: "=",
               onLoadPage: "=",
               mode: "=",
               onColumnMove:"="
           },

           controller: function ($scope) {
               var pagingTemplate = "<div ng-show=\"enablePaging\" class=\"PaginationPannel\">"
                                           + "<div class=\"pagination\">"
                                           + "<button  type=\"button\" ng-click=\"loadFirstPage()\" class=\"ui-grid-pager-first disable-ctrl1\" title=\"{{::'paging_first' | translate}}\"><div class=\"first-triangle\"><div class=\"first-bar\"></div></div></button>"
                                           + "<button  type=\"button\" ng-click=\"loadPrevPage()\" class=\"ui-grid-pager-previous disable-ctrl1\" title=\"{{::'paging_prev' | translate}}\"><div class=\"first-triangle prev-triangle\"></div></button>"
                                           + "<span class=\"pageCounts\">Page <input class=\"numberType hrsTxt\" ng-model=\"currentPageNo\" ng-enter=\"loadDataOnEnter()\" type=\"number\"> <abbr translate=\"lbl_of\"></abbr> {{totalPage}}</span>"
                                           + "<button type=\"button\" ng-click=\"loadNextPage()\" class=\"ui-grid-pager-next enable-ctrl\" title=\"{{::'paging_forward' | translate}}\"><div class=\"last-triangle next-triangle\"></div></button>"
                                           + "<button type=\"button\" ng-click=\"loadLastPage()\" class=\"ui-grid-pager-last enable-ctrl\" title=\"{{::'paging_last' | translate}}\"><div class=\"last-triangle\"><div class=\"last-bar\"></div></div></button>"
                                           + "<button type=\"button\" ng-click=\"refreshPage()\" class=\"fa-spinner\" title=\"{{::'lbl_rfrsh' | translate}}\"><i class=\"fa fa-spinner\"></i></button>"
                                           + "</div><div class=\"resultsInCounts\"><span translate=\"msg_nodsplyRslt\" ng-show=\"conf.Data.length==0\"></div><div class=\"resultsInCounts\" ng-hide=\"conf.Data.length==0\"></span><span translate=\"msg_dsplyRslt\"></span><span> {{pageFrom}} <abbr>-</abbr> {{pageTo}}</span> <span translate=\"lbl_of\"></span> <span>{{totalItems}}</span></div>"
                                           + " </div>";
               $scope.refreshTitle = $filter('translate')('lbl_rfrsh');
               var _currentPageNo = 1;
               var _sortField = null;
               var option = {
                   groupByInfo: {
                       itemTxt: "Item",
                       itemsTxt: "Items",
                       clientTxt: "Client"
                   },
                   sortInfo: {
                       asc: true,
                       unSortableCol: ["CEPFAV"]
                   },
                   css: {
                       sortClass: 'sortColumn',
                       sortDirAscCls: "glyphicon-triangle-top",
                       sortDirDescCls: "glyphicon-triangle-bottom",
                       headCls: 'headSpan',
                       cepFavStarCls: "fa-star",
                       cepNonFavStarCls: "fa-star-o",
                       cepDeleteCls: "entry-delete"
                   },
                   removeBy: "PRJID",
                   defaultSortField: 'CEPCODE',

                   pagerParentId: "cusGridPager",
                   tableId: "cepFavTblGrid",
                   pageingInfo: {
                       disableCls: "disable-ctrl",
                       enableCls: "enable-ctrl"
                   }
               }
               //cep fav grid
               if ($scope.mode == "1") {
                   _sortField = option.defaultSortField;
               }
                   //cep search grid
               else {
                   _sortField = $scope.conf.sortField;
               }

               var setTableHeader = function () {
                   var headers = "";
                   nonResizableCol = [];
                   angular.element(document.getElementById('tblHead')).html("");
                   var sortIcon = "";
                   $("#cepFavTblGrid").css('width', $scope.conf.availableWidth);
                   var defaultSortCls = "";
                   var sortDirCls = "";
                   for (var i = 0; i < $scope.conf.heads.length; i++) {
                       defaultSortCls = option.css.headCls;
                       sortDirCls = "";
                       if ($scope.conf.heads[i].field == _sortField) {
                           defaultSortCls = option.css.headCls + " " + option.css.sortClass;
                           $scope.conf.heads[i].sortDirection = option.sortInfo.asc;
                           sortDirCls = option.css.sortDirAscCls;
                       }
                       if ($scope.conf.heads[i].field == "CEPFAV" || $scope.conf.heads[i].field == "CEPCODE" || $scope.conf.heads[i].field=="CHARBASIS") {
                           nonResizableCol.push($scope.conf.heads[i].index);
                       }
                       //headers += "<th  id=" + $scope.conf.heads[i].index + " ng-click=sortData('" + $scope.conf.heads[i].index + "')  style='width:" + $scope.conf.heads[i].width + "px'><span class='" + defaultSortCls + "'>" + $scope.conf.heads[i].displayName + "</span>" + sortIcon + "</th>";
                       headers += "<th  id=" + $scope.conf.heads[i].index + " ng-click=sortData('" + $scope.conf.heads[i].index + "')  style='width:" + $scope.conf.heads[i].width + "px'><span wdth="+$scope.conf.heads[i].width+" class='" + defaultSortCls + "'>" + $scope.conf.heads[i].displayName + "<i class=\"glyphicon " + sortDirCls + " \"></i></span>" + sortIcon + "</th>";

                   }
                   var temp = $compile(headers)($scope);
                   angular.element(document.getElementById('tblHead')).append(temp);
                   $("#" + option.tableId).colResizable({ disabledColumns:nonResizableCol});
                   $("#" + option.tableId).jsdragtable(afterColumnDrg);
               }

               var setupPagingdefaultSettings = function () {
                   $scope.totalItems = null;
                   $scope.currentPageNo = 1;
                   $scope.pageSize = $scope.conf.reordPerPage;
                   $scope.totalPage = 1;
                   $scope.pageFrom = null;
                   $scope.pageTo = null;
                   var temp = $compile(pagingTemplate)($scope);
                   angular.element(document.getElementById(option.pagerParentId)).append(temp);
                   $scope.conf.dataHeight = $scope.conf.dataHeight;
               }
               setTableHeader();

               if ($scope.enablePaging)
                   setupPagingdefaultSettings();

               $scope.sortData = function (headerIndex) {                  
                   if (localStorage.isColumnMoved || ($scope.mode == "1" && option.sortInfo.unSortableCol.indexOf($scope.conf.heads[headerIndex].field) >= 0))
                       return false;
                   headerIndex = parseInt(headerIndex);
                   var prevSortDirection = $scope.conf.heads[headerIndex].sortDirection;
                   $('span.headSpan').removeClass(option.css.sortClass);
                   $("#" + headerIndex + ">span").addClass(option.css.sortClass);
                   $("span.headSpan> i").removeClass(option.css.sortDirAscCls);
                   $("span.headSpan> i").removeClass(option.css.sortDirDescCls);
                   $scope.conf.heads.forEach(function (head) {
                       head.sortDirection = null;
                   });
                   //true means asc
                   $scope.conf.heads[headerIndex].sortDirection = !prevSortDirection;
                   if ($scope.conf.heads[headerIndex].sortDirection) {
                       $("#" + headerIndex + ">span i").addClass(option.css.sortDirAscCls);
                   }
                   else {
                       $("#" + headerIndex + ">span i").addClass(option.css.sortDirDescCls);
                   }
                   _sortField = $scope.conf.heads[headerIndex].field;
                   $scope.onSortData($scope.conf.heads[headerIndex]);
               }

               $scope.doubleClick = function (rowIndex) {
                   $scope.onSelectCep($scope.conf.Data[rowIndex]);
               }

               updateDirectiveCepFavRecord = function (rowIndex, isRemove, event) {
                   var record = $scope.conf.Data[rowIndex];
                   if ($scope.mode == "1") {
                       $scope.onRemoveFav(record, true, true);
                   }
                   else {
                       if (record.CEPFAV == "Y") {
                           $scope.onRemoveFav(record, false, true);
                           $("span", $(event.target)).removeClass(option.css.cepFavStarCls);
                           $("span", $(event.target)).addClass(option.css.cepNonFavStarCls);
                       }
                       else {
                           $scope.onRemoveFav(record, false, false);
                           $("span", $(event.target)).addClass(option.css.cepFavStarCls);
                           $("span", $(event.target)).removeClass(option.css.cepNonFavStarCls);
                       }


                   }
               }
               $scope.loadDataOnEnter = function () {
                   if (!$scope.currentPageNo)
                       $scope.currentPageNo = 1;
                   else if ($scope.currentPageNo > $scope.totalPage)
                       $scope.currentPageNo = $scope.totalPage;
                   else if ($scope.currentPageNo < 1)
                       $scope.currentPageNo = 1;
                   callPaging($scope.currentPageNo);
               }

               $scope.loadNextPage = function () {
                   if (_currentPageNo >= $scope.totalPage) return;
                   var nextPageNo = _currentPageNo + 1;
                   if (nextPageNo > $scope.totalPage)
                       nextPageNo = $scope.totalPage;
                   callPaging(nextPageNo);
               }
               $scope.loadLastPage = function () {
                   if (_currentPageNo >= $scope.totalPage) return;
                   callPaging($scope.totalPage);
               }
               $scope.trClick = function (index, event) {
                   $scope.trSelected = index;
                   // $(event.target).addClass("selectedTr");
               }
               $scope.loadFirstPage = function () {
                   if (_currentPageNo == 1) return;
                   callPaging(1);
               }

               $scope.loadPrevPage = function () {
                   if (_currentPageNo == 1) return;
                   var prevPageNo = _currentPageNo - 1;
                   prevPageNo = prevPageNo < 1 ? 1 : prevPageNo;
                   callPaging(prevPageNo);
               }
               $scope.refreshPage = function () {
                   //callPaging(_currentPageNo);
                   $scope.loadDataOnEnter();
               }

               var callPaging = function (pageNo) {
                   var isFavMode = ($scope.mode == "1" ? true : false);
                   $scope.onLoadPage(pageNo, isFavMode);
               }
               var setTableBody = function () {
                   var tbodyHtml = "";
                   var tdHtml = "";
                   var billableVar = $filter('translate')('msg_BillableVar');
                   var nonbillableVar = "Non " + $filter('translate')('msg_BillableVar');
                   $("#tblBody").html(tbodyHtml);
                   for (var i = 0; i < $scope.conf.Data.length; i++) {
                       tbodyHtml += "<tr";
                       if ($scope.conf.Data[i].isHeader) {
                           tbodyHtml += " class='trHeaderVisible'>"
                           for (var j = 0; j < $scope.conf.heads.length; j++) {
                               tbodyHtml += "<td ><i expand-collapse-rows=" + $scope.conf.Data[i].hId + " class='minusImgBg' ></i><span>" + ($scope.conf.Data[i].CEPFAV) + "</span></td>";
                           }
                       }
                       else {
                           tbodyHtml += " ng-right-click=\"trClick\" tr-index=" + $scope.conf.Data[i].rowIndex + " oncontextmenu=\"return false\" ng-class=\"{selectedTr : " + $scope.conf.Data[i].rowIndex + " === trSelected}\" ng-click='trClick(" + $scope.conf.Data[i].rowIndex + ",$event)' ng-dblClick='doubleClick(" + $scope.conf.Data[i].rowIndex + ")' class='dataRow " + $scope.conf.Data[i].hId + "'>";
                           for (var j = 0; j < $scope.conf.heads.length; j++) {
                               var record = $scope.conf.Data[i];
                               var tdCls = "";
                               var bindClick = "";
                               var spanCls = "";
                               var data = record[$scope.conf.heads[j].field];
                               var title = record[$scope.conf.heads[j].field];
                               if ($scope.conf.heads[j].field == "CEPFAV") {
                                   data = "";
                                   if ($scope.mode == "1") {
                                       title = $filter('translate')('btn_Delete');
                                       tdCls = " class=" + option.css.cepDeleteCls;
                                       bindClick = "onclick='updateDirectiveCepFavRecord(" + $scope.conf.Data[i].rowIndex + ")'";                                      
                                   }
                                   else {
                                       title = "";
                                       var isFav = record[$scope.conf.heads[j].field] == "Y";
                                       spanCls = (isFav) ? '\"fa fa-star\"' : '\"fa fa-star-o\"';
                                       spanCls = "class=" + spanCls;                                     
                                       bindClick = "onclick='updateDirectiveCepFavRecord(" + $scope.conf.Data[i].rowIndex + "," + isFav + ",event)'"

                                   }
                               }
                               else if ($scope.conf.heads[j].field == "CHARBASIS") {
                                   var d = $scope.conf.Data[i][$scope.conf.heads[j].field];
                                   //$scope.conf.Data[i].charbasisType = d;
                                   title = data = ((d === "S" || d === "C" || d === "R") ? "Chargeable" : ((d === "T") ? billableVar : nonbillableVar));

                               }

                               tbodyHtml += "<td " + bindClick + tdCls + " title=\"" + (title) + "\" ><span " + spanCls + ">" + (data) + "</span></td>";
                           }
                       }
                       tbodyHtml += "</tr>";
                   }
                   var temp = $compile(tbodyHtml)($scope);
                   angular.element(document.getElementById('tblBody')).append(temp);
               }

               var getHeader = function (temp) {
                   var itemTxt = (temp.childRowCount > 1) ? option.groupByInfo.itemsTxt : option.groupByInfo.itemTxt;
                   var header = option.groupByInfo.clientTxt + ": " + temp.HeaderText + " - " + temp.CLIENAME + " (" + temp.childRowCount + " " + itemTxt + ")";
                   return header;
               }

               var groupByData = function (gridDataAr) {
                   var temp = [];                  
                   temp[0] = { CEPFAV: gridDataAr[0].CLIENO, isHeader: true, childRowCount: 0, HeaderText: gridDataAr[0].CLIENO, hId: 0, CLIENAME: gridDataAr[0].CLIENAME };
                   var pIndex = 0;
                   var prevHeader = gridDataAr[0].CLIENO;
                   for (var i = 0; i < gridDataAr.length; i++) {
                       if (prevHeader == gridDataAr[i].CLIENO) {
                           temp[pIndex].childRowCount += 1;
                           temp[pIndex].CEPFAV = getHeader(temp[pIndex]);
                           temp[temp.length] = (gridDataAr[i]);
                           temp[temp.length - 1].hId = temp[pIndex].hId;
                           temp[temp.length - 1].rowIndex = temp.length - 1;
                       }
                       else {
                           prevHeader = gridDataAr[i].CLIENO;
                           pIndex = temp.length;
                           temp[temp.length] = ({ CEPFAV: prevHeader, isHeader: true, childRowCount: 1, HeaderText: prevHeader, hId: pIndex, CLIENAME: gridDataAr[i].CLIENAME });
                           temp[temp.length - 1].CEPFAV = getHeader(temp[temp.length - 1]);
                           temp[temp.length] = (gridDataAr[i]);
                           temp[temp.length - 1].rowIndex = temp.length - 1;
                           temp[temp.length - 1].hId = temp[temp.length - 2].hId;
                       }
                   }
                   return temp;

               }

               var updatePagingUi = function () {
                   _currentPageNo = $scope.conf.currentPageNo;
                   $scope.totalItems = $scope.conf.totalItems;
                   $scope.currentPageNo = _currentPageNo;
                   $scope.totalPage = getTotalPages($scope.totalItems, $scope.pageSize);
                   $scope.pageFrom = (($scope.currentPageNo - 1) * $scope.pageSize) + 1;
                   $scope.pageTo = Math.min($scope.currentPageNo * $scope.pageSize, $scope.totalItems);

                   if (_currentPageNo <= 1) {
                       $(".PaginationPannel .pagination>button").removeClass(option.pageingInfo.disableCls);
                       $(".PaginationPannel .pagination button").eq(0).addClass(option.pageingInfo.disableCls);
                       $(".PaginationPannel .pagination button").eq(1).addClass(option.pageingInfo.disableCls);
                       if ($scope.totalPage == 1) {
                           $(".PaginationPannel .pagination button").eq(2).addClass(option.pageingInfo.disableCls);
                           $(".PaginationPannel .pagination button").eq(3).addClass(option.pageingInfo.disableCls);
                       }
                       else {
                           $(".PaginationPannel .pagination button").eq(2).addClass(option.pageingInfo.enableCls);
                           $(".PaginationPannel .pagination button").eq(3).addClass(option.pageingInfo.enableCls);
                       }
                   }
                   else if (_currentPageNo >= $scope.totalPage) {
                       $(".PaginationPannel .pagination>button").removeClass(option.pageingInfo.disableCls);
                       $(".PaginationPannel .pagination button").eq(0).addClass(option.pageingInfo.enableCls);
                       $(".PaginationPannel .pagination button").eq(1).addClass(option.pageingInfo.enableCls);
                       $(".PaginationPannel .pagination button").eq(2).addClass(option.pageingInfo.disableCls);
                       $(".PaginationPannel .pagination button").eq(3).addClass(option.pageingInfo.disableCls);
                   }
                       //al buttons are disable   
                   else {
                       $(".PaginationPannel .pagination>button").removeClass(option.pageingInfo.disableCls);

                   }
               }
               var getHeaderOrder = function () {
                   var tblHdOrder = [];
                   $('#cepFavTblGrid thead th').each(function () {
                       var id = $(this).attr("id");
                       tblHdOrder.push(id);

                   });
                   return tblHdOrder;
               }
               var updateColumnHeader = function (headers) {
                   var newHeaderOrder = [];
                   for (var i = 0; i < headers.length; i++) {
                       var header = $filter('filter')($scope.conf.heads, function (hd) { return hd.index.toString() === headers[i] })[0];
                       newHeaderOrder[i] = JSON.parse(JSON.stringify(header));
                       newHeaderOrder[i].index = i;
                   }

                   $scope.conf.heads = newHeaderOrder;                  
                   setTableHeader();
               }
               var afterColumnDrg = function () {
                   var headers = getHeaderOrder();
                   updateColumnHeader(headers);
                   $scope.onColumnMove();                   
               }
               var renderTableData = function () {
                   setTableBody();
                   $("#" + option.tableId).colResizable({ disabledColumns: nonResizableCol });
                   $("#" + option.tableId).jsdragtable(afterColumnDrg);
                   var tableHeight = ($scope.conf.Data.length + 2) * (16 + 4) + 10;
                   setTimeout(function () {
                       $(".JCLRgrip").height(tableHeight)
                   });
               }
               var watchListner = $scope.$watch('conf.myData', function (newVal) {
                   if (newVal) {
                       if (newVal.length > 0) {
                           $scope.conf.Data = JSON.parse(JSON.stringify(groupByData(newVal)));
                           renderTableData();
                           $('#modal').animate({ scrollTop: 0 }, 'slow');
                           updatePagingUi();
                       }
                       else {
                           $scope.conf.Data = [];
                           $scope.totalPage = getTotalPages($scope.conf.totalItems, $scope.pageSize);
                           $scope.currentPageNo = $scope.conf.currentPageNo;
                           $("#" + option.tableId).jsdragtable(afterColumnDrg);
                           $("#" + option.tableId).colResizable({ disabledColumns: nonResizableCol });
                           angular.element(document.getElementById('tblBody')).html("");
                       }
                   }
               });

               $scope.$on('$destroy', watchListner);

           },
           compile: function (elem) {
               return function (ielem, $scope) {
                   $compile(ielem)($scope);
               };
           }
       };
   }
])
 .directive('ngRightClick', function () {
        return {
            scope: {
                ngRightClick: "=",
                trIndex: "="
            },
            link: function (scope, element, attr) {
                element.bind('contextmenu', function (event) {
                    scope.$apply(function () {
                        event.preventDefault();
                        scope.ngRightClick(scope.trIndex);
                    });
                });
            }
        }
    })
.directive('expandCollapseRows', function ($document) {
    return {
        link: function (scope, element, attr) {
            element.on('click', function (event) {
                var clsName = "." + attr.expandCollapseRows;
                if ($(element).hasClass("minusImgBg")) {
                    $(element).removeClass('minusImgBg');
                    $(element).addClass('plusImgBg');
                    $(clsName).hide();
                }
                else {
                    $(element).removeClass('plusImgBg');
                    $(element).addClass('minusImgBg');
                    $(clsName).show();
                }
            })
        }
    }
})
