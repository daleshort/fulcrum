#from django.shortcuts import render
# # Create your views here.
# from itertools import product
# from multiprocessing import context
# from urllib import request


from itertools import product
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from .models import Project, ProjectTag
from .serializers import *
from rest_framework.response import Response
from rest_framework import status

# Create your views here.

# measures


class MeasureViewSet(ModelViewSet):
    serializer_class = MeasureSerializer
    queryset = Measure.objects.all()

    def get_serializer_context(self):
        return {'project_id': self.kwargs['project_pk']}
# list of all projects


class ProjectViewSet(ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

# list of all tags in all projects


class ProjectTagListViewSet(ModelViewSet):
    serializer_class = ProjectTagListSerializer
    queryset = ProjectTag.objects.all()

    def create(self, request, *args, **kwargs):
        project_id = request.data['project_id']
        _serializer = self.serializer_class(
            data=request.data, context={'project_id': project_id})
        if _serializer.is_valid():
            _serializer.save()
            return Response(data=_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(data=_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# tags for a specific project


class ProjectTagViewSet(ModelViewSet):
    serializer_class = ProjectTagSerializer

    def get_queryset(self):
        return ProjectTag.objects.filter(project_id=self.kwargs['project_pk'])

    def get_serializer_context(self):
        return {'project_id': self.kwargs['project_pk']}
