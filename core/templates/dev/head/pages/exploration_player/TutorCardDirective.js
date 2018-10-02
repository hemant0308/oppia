// Copyright 2017 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Controller for the Tutor Card.
 */

oppia.animation('.conversation-skin-responses-animate-slide', function() {
  return {
    removeClass: function(element, className, done) {
      if (className !== 'ng-hide') {
        done();
        return;
      }
      element.hide().slideDown(400, done);
    },
    addClass: function(element, className, done) {
      if (className !== 'ng-hide') {
        done();
        return;
      }
      element.slideUp(400, done);
    }
  };
});

oppia.directive('tutorCard', [
  'UrlInterpolationService', function(UrlInterpolationService) {
    return {
      restrict: 'E',
      scope: {
        isLearnAgainButton: '&',
        onDismiss: '&',
        getDisplayedCard: '&displayedCard',
        startCardChangeAnimation: '=',
      },
      templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
        '/pages/exploration_player/' +
        'tutor_card_directive.html'),
      controller: [
        '$scope', '$anchorScroll', '$location', 'UrlService',
        'ContextService',
        'WindowDimensionsService', 'DeviceInfoService', 'AudioPlayerService',
        'AutogeneratedAudioPlayerService', 'AudioPreloaderService',
        'AudioTranslationManagerService', 'CurrentInteractionService',
        'TWO_CARD_THRESHOLD_PX', 'CONTENT_FOCUS_LABEL_PREFIX',
        'EVENT_ACTIVE_CARD_CHANGED',
        'EVENT_NEW_CARD_AVAILABLE', 'UserService',
        'COMPONENT_NAME_CONTENT', 'AUDIO_HIGHLIGHT_CSS_CLASS',
        'DEFAULT_PROFILE_IMAGE_PATH', 'ExplorationPlayerStateService',
        function(
            $scope, $anchorScroll, $location, UrlService,
            ContextService,
            WindowDimensionsService, DeviceInfoService, AudioPlayerService,
            AutogeneratedAudioPlayerService, AudioPreloaderService,
            AudioTranslationManagerService, CurrentInteractionService,
            TWO_CARD_THRESHOLD_PX, CONTENT_FOCUS_LABEL_PREFIX,
            EVENT_ACTIVE_CARD_CHANGED,
            EVENT_NEW_CARD_AVAILABLE, UserService,
            COMPONENT_NAME_CONTENT, AUDIO_HIGHLIGHT_CSS_CLASS,
            DEFAULT_PROFILE_IMAGE_PATH, ExplorationPlayerStateService) {
          var _editorPreviewMode = ContextService.isInExplorationEditorPage();
          var updateDisplayedCard = function() {
            $scope.arePreviousResponsesShown = false;
            $scope.lastAnswer = null;
            $scope.conceptCardIsBeingShown = Boolean(
              !$scope.getDisplayedCard().getInteraction());
            $scope.interactionIsActive =
              !$scope.getDisplayedCard().isCompleted();
            $scope.$on(EVENT_NEW_CARD_AVAILABLE, function(evt, data) {
              $scope.interactionIsActive = false;
            });
            CurrentInteractionService.registerPresubmitHook(function() {
              $scope.waitingForOppiaFeedback = true;
            });
            if (!$scope.interactionIsActive) {
              $scope.lastAnswer = $scope.getDisplayedCard().getLastAnswer();
            }
            if (!$scope.conceptCardIsBeingShown) {
              $scope.interactionInstructions = (
                $scope.getDisplayedCard().getInteractionInstructions());
              $scope.contentAudioTranslations = (
                $scope.getDisplayedCard().getAudioTranslations());
              AudioTranslationManagerService.clearSecondaryAudioTranslations();
              AudioTranslationManagerService.setContentAudioTranslations(
                angular.copy($scope.contentAudioTranslations),
                $scope.getDisplayedCard().getContentHtml(),
                COMPONENT_NAME_CONTENT);
              AudioPlayerService.stop();
              AudioPreloaderService.clearMostRecentlyRequestedAudioFilename();
              AutogeneratedAudioPlayerService.cancel();
            }
          };

          $scope.isInteractionInline = function() {
            if ($scope.conceptCardIsBeingShown) {
              return true;
            }
            return $scope.getDisplayedCard().isInteractionInline();
          };

          $scope.getContentAudioHighlightClass = function() {
            if (AudioTranslationManagerService
              .getCurrentComponentName() ===
              COMPONENT_NAME_CONTENT &&
              (AudioPlayerService.isPlaying() ||
              AutogeneratedAudioPlayerService.isPlaying())) {
              return AUDIO_HIGHLIGHT_CSS_CLASS;
            }
          };

          $scope.arePreviousResponsesShown = false;

          $scope.waitingForOppiaFeedback = false;

          $scope.windowDimensionsService = WindowDimensionsService;

          $scope.isIframed = UrlService.isIframed();

          $scope.OPPIA_AVATAR_IMAGE_URL = (
            UrlInterpolationService.getStaticImageUrl(
              '/avatar/oppia_avatar_100px.svg'));

          $scope.profilePicture = UrlInterpolationService.getStaticImageUrl(
            '/avatar/user_blue_72px.png');

          if (!_editorPreviewMode) {
            UserService.getProfileImageDataUrlAsync()
              .then(function(dataUrl) {
                $scope.profilePicture = dataUrl;
              });
          } else {
            $scope.profilePicture = (
              UrlInterpolationService.getStaticImageUrl(
                DEFAULT_PROFILE_IMAGE_PATH));
          }

          $scope.getContentFocusLabel = function(index) {
            return CONTENT_FOCUS_LABEL_PREFIX + index;
          };

          $scope.toggleShowPreviousResponses = function() {
            $scope.arePreviousResponsesShown =
             !$scope.arePreviousResponsesShown;
          };

          $scope.isWindowNarrow = function() {
            return WindowDimensionsService.isWindowNarrow();
          };

          $scope.canWindowShowTwoCards = function() {
            return WindowDimensionsService.getWidth() > TWO_CARD_THRESHOLD_PX;
          };

          $scope.showAudioBar = function() {
            return (
              !$scope.isIframed &&
              !ExplorationPlayerStateService.isInPretestMode());
          };

          $scope.isContentAudioTranslationAvailable = function() {
            if ($scope.conceptCardIsBeingShown) {
              return false;
            }
            return (
              $scope.getDisplayedCard().isContentAudioTranslationAvailable());
          };

          $scope.isCurrentCardAtEndOfTranscript = function() {
            return !$scope.getDisplayedCard().isCompleted();
          };

          $scope.isOnTerminalCard = function() {
            return (
              $scope.getDisplayedCard().isTerminal());
          };

          $scope.getInputResponsePairId = function(index) {
            return 'input-response-pair-' + index;
          };

          $scope.$on(EVENT_ACTIVE_CARD_CHANGED, function() {
            updateDisplayedCard();
          });

          $scope.$on('oppiaFeedbackAvailable', function() {
            $scope.waitingForOppiaFeedback = false;

            // Auto scroll to the new feedback on mobile device.
            if (DeviceInfoService.isMobileDevice()) {
              var latestFeedbackIndex = (
                $scope.getDisplayedCard().getInputResponsePairs().length - 1);
              /* Reference: https://stackoverflow.com/questions/40134381
                 $anchorScroll() without changing actual hash value of url works
                 only when written inside a timeout of 0 ms. */
              $anchorScroll.yOffset = 80;
              $location.hash(
                $scope.getInputResponsePairId(latestFeedbackIndex));
              $anchorScroll();
            }
          });

          updateDisplayedCard();
        }
      ]
    };
  }
]);
