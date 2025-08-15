FROM gitpod/workspace-full

# Install Android development tools
RUN sudo apt-get update && \
    sudo apt-get install -y openjdk-17-jdk && \
    sudo update-java-alternatives --set java-1.17.0-openjdk-amd64

# Install Node.js 18
RUN bash -c ". .nvm/nvm.sh && nvm install 18 && nvm use 18 && nvm alias default 18"

# Set Java environment
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64