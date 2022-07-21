from cgitb import lookup
from django.urls import path
from . import views
from rest_framework_nested import routers

router = routers.DefaultRouter()

#list of projects
router.register('projects', views.ProjectViewSet, basename='projects')
#list of all tags
router.register('taglist', views.ProjectTagListViewSet)
#a list of all measures
router.register('measures', views.MeasureViewSet)


tags_router = routers.NestedDefaultRouter(router, 'projects', lookup='project')
#nested tags associated with a project
tags_router.register(
    'projecttags', views.ProjectTagViewSet, basename='projecttags')
#nested measures associated with a project
tags_router.register(
    'measures', views.MeasureViewSet, basename='measures'
)
# URL conf
urlpatterns = router.urls + tags_router.urls
