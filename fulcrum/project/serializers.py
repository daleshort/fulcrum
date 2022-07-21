from rest_framework import serializers
from .models import Measure, MeasureTag, Parameter, Project, ProjectTag

# https://ilovedjango.com/django/rest-api-framework/tips/save-foreign-key-using-django-rest-framework-create-method/

# serializer for all tags in all projects


class ProjectTagListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectTag
        fields = ['id', 'tag_text', 'project_id']

    def create(self, validated_data):

        print(validated_data)
        return ProjectTag.objects.create(project_id=self.context['project_id'], ** validated_data)

# serializer for a specific projects tags


class ProjectTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectTag
        fields = ['id', 'tag_text', 'project_id']

    def create(self, validated_data):
        project_id = self.context['project_id']
        return ProjectTag.objects.create(project_id=project_id, **validated_data)


class MeasureTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeasureTag
        fields = ['id', 'tag_text', 'measure_id']


class ParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parameter
        fields = ['id', 'parameter', 'parameter_title', 'measure_id']


class MeasureSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        project_id = self.context['project_id']
        return Measure.objects.create(project_id=project_id, **validated_data)

    class Meta:
        model = Measure
        fields = ['id', 'title', 'units', 'project_id']


# project serializer
class ProjectSerializer(serializers.ModelSerializer):
    tags = ProjectTagSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'title', 'tags']
